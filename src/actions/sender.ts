"use server";

import { revalidatePath } from "next/cache";
import axios from "axios";
import { getSession } from "@/lib/actions/auth";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  try {
    const session = await getSession();
    const token = session?.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Try to get token from cookie as fallback
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get("authjs.session-token");
      if (sessionCookie?.value) {
        config.headers.Authorization = `Bearer ${sessionCookie.value}`;
      } else {
        console.warn("No authentication token found in session or cookies");
      }
    }

    return config;
  } catch (error) {
    console.error("Error in request interceptor:", error);
    return config;
  }
});

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.error("Authentication failed:", error.response?.data);
      // You might want to redirect to login page here
    }
    return Promise.reject(error);
  }
);

export type Attachment = {
  id: number;
  name: string;
  type: string;
  caption: string;
  url?: string;
};

export type SendMessageRequest = {
  message: string;
  attachments: Attachment[];
  isTurboMode: boolean;
  isScheduled: boolean;
  scheduledTime?: string;
  recipients: string[];
  timeGap?: number;
  randomizeOrder?: boolean;
};

export async function sendMessage(request: SendMessageRequest) {
  try {
    const {
      message,
      attachments,
      isTurboMode,
      isScheduled,
      scheduledTime,
      recipients,
      timeGap = 0,
      randomizeOrder = false
    } = request;

    // Get the session token
    const session = await getSession();
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("authjs.session-token");
    const authToken = session?.accessToken;

    // Validate and format scheduled time
    let formattedScheduledTime = null;
    if (isScheduled && scheduledTime) {
      try {
        const scheduledDate = new Date(scheduledTime);
        if (isNaN(scheduledDate.getTime())) {
          throw new Error("Invalid date format");
        }
        formattedScheduledTime = scheduledDate.toISOString();
      } catch (error) {
        console.error("Error formatting scheduled time:", error);
        return {
          success: false,
          error: "Invalid scheduled time format",
        };
      }
    }

    // Handle randomized order
    let orderedRecipients = [...recipients];
    if (randomizeOrder) {
      orderedRecipients = orderedRecipients.sort(() => Math.random() - 0.5);
    }

    const baseRequest = {
      to: orderedRecipients,
      accessToken: process.env.WHATSAPP_TOKEN,
      delayBetweenMessagesInMs: timeGap * 1000, // Convert seconds to milliseconds
      scheduledTimeInUtc: formattedScheduledTime,
    };

    if (!isTurboMode && attachments.length > 0) {
      // Handle file attachments
      for (const attachment of attachments) {
        if (attachment.type === "Image" && attachment.url) {
          const response = await api.post("/api/whatsapp/sender/Image", {
            ...baseRequest,
            image: {
              link: attachment.url,
              caption: attachment.caption,
              filename: attachment.name,
            },
          });
          console.log("Image message response:", response.data);
        } else if (attachment.type === "Document" && attachment.url) {
          const response = await api.post("/api/whatsapp/sender/document", {
            ...baseRequest,
            document: {
              link: attachment.url,
              caption: attachment.caption,
              filename: attachment.name,
            },
          });
          console.log("Document message response:", response.data);
        }
      }
    }

    if (message.trim() || isTurboMode) {
      const textRequest = {
        ...baseRequest,
        text: {
          preview_url: false,
          body: message,
        },
      };

      console.log("Sending text request:", JSON.stringify(textRequest, null, 2));
      
      const response = await api.post("/api/whatsapp/sender/text", textRequest);
      console.log("Text message response:", response.data);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error sending message:", error);
    if (axios.isAxiosError(error)) {
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
      });
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to send message";
      return {
        success: false,
        error: errorMessage,
        details: error.response?.data
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send message",
    };
  }
}

export type TemplateRequest = {
  to: string[];
  accessToken: string;
  delayBetweenMessagesInMs: number;
  scheduledTimeInUtc: string | null;
  template: {
    name: string;
    language: {
      policy: string;
      code: string;
    };
    components: {
      type: string;
      parameters: Array<{
        type: string;
        text: string;
      }>;
    };
  };
};

export async function sendTemplate(request: TemplateRequest) {
  try {
    const { to, template } = request;

    // Get the session token
    const session = await getSession();
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("authjs.session-token");
    const authToken = session?.accessToken;
    console.log("session accessToken: ", session?.accessToken);

    if (!authToken || !sessionCookie) {
      return {
        success: false,
        error: "Authentication token not found",
      };
    }

    const response = await api.post(
      "/api/whatsapp/sender/template",
      {
        to: to,
        accessToken: process.env.WHATSAPP_TOKEN,
        delayBetweenMessagesInMs: 0,
        scheduledTimeInUtc: null,
        template: {
          name: "hello_world",
          language: {
            policy: "deterministic",
            code: "en_US",
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    console.log("Template message response:", response.data);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error sending template:", error);
    if (axios.isAxiosError(error)) {
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
      });
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to send template";
      return {
        success: false,
        error: errorMessage,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send template",
    };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import axios from "axios";
import { getSession } from "@/lib/actions/auth";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Response type for sender operations
 */
type SenderResponse = {
  success: boolean;
  data?: any;
  error?: string;
  details?: any;
};

/**
 * Represents a file attachment for a message
 */
export type Attachment = {
  id: number;
  name: string;
  type: string;
  caption: string;
  url?: string;
};

/**
 * Represents a request to send a message
 */
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

/**
 * Represents a template message request
 */
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

/**
 * Sends a message to multiple recipients
 * @param {SendMessageRequest} request - The message request details
 * @returns {Promise<SenderResponse>}
 * Returns a promise that resolves to an object containing:
 * - success: boolean indicating if the message was sent successfully
 * - data: the response data if successful
 * - error: error message if the request failed
 * - details: additional error details if available
 */
export async function sendMessage(
  request: SendMessageRequest
): Promise<SenderResponse> {
  try {
    const {
      message,
      attachments,
      isTurboMode,
      isScheduled,
      scheduledTime,
      recipients,
      timeGap = 0,
      randomizeOrder = false,
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
          return {
            success: false,
            error: "Invalid scheduled time format",
          };
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

      console.log(
        "Sending text request:",
        JSON.stringify(textRequest, null, 2)
      );

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
        details: error.response?.data,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send message",
    };
  }
}

/**
 * Sends a template message to multiple recipients
 * @param {TemplateRequest} request - The template message request details
 * @returns {Promise<SenderResponse>}
 * Returns a promise that resolves to an object containing:
 * - success: boolean indicating if the template was sent successfully
 * - data: the response data if successful
 * - error: error message if the request failed
 */
export async function sendTemplate(
  request: TemplateRequest
): Promise<SenderResponse> {
  try {
    const { to, template } = request;

    // Get the session token
    const session = await getSession();
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("authjs.session-token");
    const authToken = session?.accessToken;

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
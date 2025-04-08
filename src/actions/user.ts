"use server";

import { revalidatePath } from "next/cache";
import axios from "axios";
import { getSession } from "@/lib/actions/auth";

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
      console.warn("No authentication token found in session");
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
 * Fetches the user's message history
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 * Returns a promise that resolves to an object containing:
 * - success: boolean indicating if the request was successful
 * - data: the message history data if successful
 * - error: error message if the request failed
 */
export async function getUserHistory() {
  try {
    const response = await api.get("/api/user/history");
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching user history:", error);
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch user history";
      return {
        success: false,
        error: errorMessage,
      };
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch user history",
    };
  }
}

/**
 * Fetches the user's contacts list
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 * Returns a promise that resolves to an object containing:
 * - success: boolean indicating if the request was successful
 * - data: the contacts data if successful
 * - error: error message if the request failed
 */
export async function getUserContacts() {
  try {
    const response = await api.get("/api/user/contacts");
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching user contacts:", error);
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch user contacts";
      return {
        success: false,
        error: errorMessage,
      };
    }
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch user contacts",
    };
  }
}

/**
 * Fetches the message history for a specific contact
 * @param {string} contact - The phone number of the contact
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 * Returns a promise that resolves to an object containing:
 * - success: boolean indicating if the request was successful
 * - data: the contact's message history if successful
 * - error: error message if the request failed
 */
export async function getContactHistory(contact: string) {
  try {
    const response = await api.get("/api/user/contact-history", {
      params: { contact },
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching contact history:", error);
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch contact history";
      return {
        success: false,
        error: errorMessage,
      };
    }
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch contact history",
    };
  }
}

/**
 * Fetches all scheduled messages for the user
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 * Returns a promise that resolves to an object containing:
 * - success: boolean indicating if the request was successful
 * - data: the scheduled messages data if successful
 * - error: error message if the request failed
 */
export async function getScheduledMessages() {
  try {
    const response = await api.get("/api/user/scheduled-messages");
    console.log(response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching scheduled messages:", error);
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch scheduled messages";
      return {
        success: false,
        error: errorMessage,
      };
    }
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch scheduled messages",
    };
  }
}

/**
 * Updates a scheduled message
 * @param {string} id - The ID of the scheduled message to update
 * @param {string} dueDateUTC - The new scheduled date and time in UTC
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updateScheduledMessage(id: string, dueDateUTC: string) {
  try {
    const response = await api.post("/api/user/update-scheduled-messages", {
      id,
      dueDateUTC,
    });
    revalidatePath("/");
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error updating scheduled message:", error);
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update scheduled message";
      return {
        success: false,
        error: errorMessage,
      };
    }
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update scheduled message",
    };
  }
}

/**
 * Cancels a scheduled message
 * @param {string} id - The ID of the scheduled message to cancel
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function cancelScheduledMessage(id: string) {
  try {
    const response = await api.post(
      "/api/user/cancel-scheduled-message",
      `"${id}"`
    );
    revalidatePath("/");
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error canceling scheduled message:", error);
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to cancel scheduled message";
      return {
        success: false,
        error: errorMessage,
      };
    }
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to cancel scheduled message",
    };
  }
}

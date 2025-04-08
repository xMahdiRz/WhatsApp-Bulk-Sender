"use server";

import { revalidatePath } from "next/cache";
import axios from "axios";
import { getSession } from "@/lib/actions/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Represents a contact with phone number and name
 */
export type Contact = {
  phoneNumber: string;
  name: string;
};

/**
 * Response type for contact operations
 */
type ContactResponse = {
  success: boolean;
  data?: any;
  error?: string;
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
 * Adds new contacts to the user's contact list
 * @param {Contact[]} contacts - Array of contacts to add
 * @returns {Promise<ContactResponse>}
 * Returns a promise that resolves to an object containing:
 * - success: boolean indicating if the request was successful
 * - data: the response data if successful
 * - error: error message if the request failed
 */
export async function addContacts(
  contacts: Contact[]
): Promise<ContactResponse> {
  try {
    const response = await api.post("/api/user/register-contact", { contacts });
    revalidatePath("/");
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error adding contacts:", error);
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to add contacts";
      return {
        success: false,
        error: errorMessage,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add contacts",
    };
  }
}

/**
 * Retrieves all contacts from the user's contact list
 * @returns {Promise<ContactResponse>}
 * Returns a promise that resolves to an object containing:
 * - success: boolean indicating if the request was successful
 * - data: the contacts data if successful
 * - error: error message if the request failed
 */
export async function getContacts(): Promise<ContactResponse> {
  try {
    const response = await api.get("/api/user/contacts");
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching contacts:", error);
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch contacts";
      return {
        success: false,
        error: errorMessage,
      };
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch contacts",
    };
  }
}

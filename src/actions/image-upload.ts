"use server";

import axios from "axios";

/**
 * Response type for image upload operations
 */
type ImageUploadResponse = {
  success: boolean;
  url?: string;
  error?: string;
};

/**
 * Uploads an image to ImgBB and returns the URL
 * @param {File} file - The image file to upload
 * @returns {Promise<ImageUploadResponse>}
 * Returns a promise that resolves to an object containing:
 * - success: boolean indicating if the upload was successful
 * - url: the uploaded image URL if successful
 * - error: error message if the upload failed
 */
export async function uploadImageToImgBB(
  file: File
): Promise<ImageUploadResponse> {
  try {
    const formData = new FormData();
    formData.append("image", file);

    // Check if environment variables are available
    if (
      !process.env.NEXT_PUBLIC_IMAGE_UPLOAD_URL ||
      !process.env.NEXT_PUBLIC_IMGBB_API_KEY
    ) {
      return {
        success: false,
        error:
          "Image upload configuration is missing. Please check your environment variables.",
      };
    }

    const response = await axios.post(
      process.env.NEXT_PUBLIC_IMAGE_UPLOAD_URL,
      formData,
      {
        params: {
          key: process.env.NEXT_PUBLIC_IMGBB_API_KEY,
        },
      }
    );

    if (response.data.success) {
      return {
        success: true,
        url: response.data.data.url,
      };
    }

    return {
      success: false,
      error:
        "Failed to upload image to ImgBB: " +
        (response.data.error?.message || "Unknown error"),
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: `Failed to upload image: ${
          error.response?.data?.error?.message || error.message
        }`,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload image",
    };
  }
}

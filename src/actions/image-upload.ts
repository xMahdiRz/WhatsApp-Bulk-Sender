import axios from 'axios';

export async function uploadImageToImgBB(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('image', file);

    // Check if environment variables are available
    if (!process.env.NEXT_PUBLIC_IMAGE_UPLOAD_URL || !process.env.NEXT_PUBLIC_IMGBB_API_KEY) {
      throw new Error('Image upload configuration is missing. Please check your environment variables.');
    }

    const response = await axios.post(process.env.NEXT_PUBLIC_IMAGE_UPLOAD_URL, formData, {
      params: {
        key: process.env.NEXT_PUBLIC_IMGBB_API_KEY
      }
    });

    if (response.data.success) {
      return response.data.data.url;
    } else {
      throw new Error('Failed to upload image to ImgBB: ' + (response.data.error?.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to upload image: ${error.response?.data?.error?.message || error.message}`);
    }
    throw error;
  }
} 
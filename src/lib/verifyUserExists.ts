import { auth } from "@/auth";

export async function verifyUserExists(email: string): Promise<boolean> {
  try {
    const session = await auth();
    if (!session) return false;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user/contacts`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );
    return response.ok;
  } catch (error) {
    console.error("Error verifying user:", error);
    return false;
  }
}

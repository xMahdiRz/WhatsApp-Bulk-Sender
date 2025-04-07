"use server"

import { auth } from "@/auth"
import { signIn, signOut } from "@/auth"

export async function getSession() {
  return await auth()
}

export async function login() {
  await signIn("credentials", { redirectTo: "/dashboard" })
}

export async function logout() {
  await signOut({ redirectTo: "/" })
} 
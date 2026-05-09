import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export async function requireSignedInPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

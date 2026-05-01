import type { User } from "@supabase/supabase-js";

const nameKeys = ["name", "full_name", "display_name"] as const;

export function getUserDisplayName(user: User | null) {
  if (!user) {
    return "User";
  }

  for (const key of nameKeys) {
    const value = user.user_metadata?.[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  const firstName = user.user_metadata?.first_name;
  const lastName = user.user_metadata?.last_name;

  if (typeof firstName === "string" && firstName.trim()) {
    return [firstName, typeof lastName === "string" ? lastName : ""]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(" ");
  }

  if (user.email) {
    return user.email.split("@")[0] ?? user.email;
  }

  return "User";
}

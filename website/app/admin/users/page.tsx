import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import UsersClient from "./UsersClient";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <UsersClient
      currentEmail={user?.email ?? ""}
      lastSignInAt={user?.last_sign_in_at ?? null}
    />
  );
}

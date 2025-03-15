// pages/api/auth/callback.ts
import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { error } = await supabase.auth.exchangeCodeForSession(req.query.code as string);

  if (error) {
    return res.redirect("/auth/error");
  }

  // Redirect to dashboard or homepage after login
  return res.redirect("/dashboard");
}

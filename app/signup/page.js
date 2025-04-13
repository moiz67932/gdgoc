"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      if (!supabase) {
        throw new Error(
          "Supabase client not initialized. Check your environment variables."
        );
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/profile/dashboard` },
      });

      if (error) throw error;
      console.log("Google Sign-In Success:", data);
    } catch (error) {
      console.error("Google Sign-In Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-purple-100 to-purple-50">
      <Card className="w-full max-w-md shadow-xl bg-white text-black rounded-2xl overflow-hidden">
        <CardHeader className="space-y-6 text-center pb-0">
          <div className="mx-auto w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-black">
            Sign Up to ConvoAI
          </h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-black border-gray-300 hover:bg-gray-100 rounded-xl px-6 py-5"
              onClick={handleGoogleSignup}
              disabled={loading}
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12h8" />
                    <path d="M12 8v8" />
                  </svg>
                  <span>Sign up with Google</span>
                </>
              )}
            </Button>
          </div>

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-xs text-gray-500">
              or continue with email
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="w-full text-black rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Create a password"
                className="w-full text-black rounded-xl"
              />
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-6 font-medium">
              Sign Up
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center">
          {/* Added sign in link */}
          <div className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="text-purple-600 hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>

          <div className="flex justify-center space-x-4 text-xs text-gray-500">
            <a href="#" className="hover:underline">
              Terms
            </a>
            <a href="#" className="hover:underline">
              Privacy
            </a>
            <a href="#" className="hover:underline">
              Help
            </a>
          </div>
          <p className="text-xs text-gray-500">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

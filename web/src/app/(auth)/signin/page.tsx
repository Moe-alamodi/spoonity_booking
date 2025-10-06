"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <button
          onClick={async () => {
            setLoading(true);
            try {
              await signIn("google");
            } finally {
              setLoading(false);
            }
          }}
          className="w-full rounded-md bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>
      </div>
    </main>
  );
}

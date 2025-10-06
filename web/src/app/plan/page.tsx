import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PlanForm from "./planForm";

export default async function PlanPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <div className="min-h-screen grid place-items-center p-8">
        <div className="max-w-md w-full space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Sign in required</h1>
          <p className="text-gray-500 dark:text-gray-400">Please sign in to plan a meeting.</p>
          <Link href="/api/auth/signin" className="inline-block bg-black text-white px-4 py-2 rounded">Sign in with Google</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Plan a 1:1 Meeting</h1>
      <PlanForm organizerEmail={session.user?.email ?? ""} />
    </div>
  );
}


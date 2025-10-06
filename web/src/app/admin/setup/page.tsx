import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AdminSetupPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <div className="min-h-screen grid place-items-center p-8">
        <Link href="/api/auth/signin" className="bg-black text-white px-4 py-2 rounded">Sign in</Link>
      </div>
    );
  }
  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Admin Setup</h1>
      <p>Sign in with a Google Workspace super admin account to grant Directory access.</p>
      <form action="/api/admin/bootstrap" method="post">
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Set this account as Directory admin</button>
      </form>
      <p className="text-sm text-gray-500">Ensure the account has granted the Directory scope during Google sign-in.</p>
    </div>
  );
}


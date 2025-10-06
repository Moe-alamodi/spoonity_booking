"use client";
import { useState } from "react";

export default function AdminSetupPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const startBootstrap = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/bootstrap", { method: "POST" });
      const data = await res.json();
      setResult(JSON.stringify(data));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Admin setup</h1>
      <p>Authorize Google Admin Directory access for on‑demand user search.</p>
      <button
        onClick={startBootstrap}
        className="rounded-md bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
        disabled={loading}
      >
        {loading ? "Starting..." : "Start admin bootstrap"}
      </button>
      {result && (
        <pre className="rounded-md bg-neutral-100 p-3 text-sm dark:bg-neutral-900">
{result}
        </pre>
      )}
    </main>
  );
}

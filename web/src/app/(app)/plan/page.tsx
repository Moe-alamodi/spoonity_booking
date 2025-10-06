"use client";
import { useState } from "react";
import { addDays, formatISO } from "date-fns";

export default function PlanMeetingPage() {
  const [participantEmail, setParticipantEmail] = useState("");
  const [duration, setDuration] = useState(30);
  const [step, setStep] = useState(30);
  const [topN, setTopN] = useState(5);

  const today = new Date();
  const windowStart = formatISO(today);
  const windowEnd = formatISO(addDays(today, 7));

  const handleSuggest = async () => {
    // Call API stub
    await fetch("/api/plan/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantEmail,
        durationMinutes: duration,
        stepMinutes: step,
        topN,
        windowStart,
        windowEnd,
      }),
    });
  };

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Plan a meeting</h1>
      <div className="space-y-2">
        <label className="block text-sm">Participant email</label>
        <input
          value={participantEmail}
          onChange={(e) => setParticipantEmail(e.target.value)}
          className="w-full rounded-md border px-3 py-2 dark:bg-neutral-900"
          placeholder="user@spoonity.com"
        />
      </div>
      <div className="flex gap-4">
        <div>
          <label className="block text-sm">Duration (min)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
            className="w-24 rounded-md border px-3 py-2 dark:bg-neutral-900"
          />
        </div>
        <div>
          <label className="block text-sm">Step (min)</label>
          <input
            type="number"
            value={step}
            onChange={(e) => setStep(parseInt(e.target.value) || 0)}
            className="w-24 rounded-md border px-3 py-2 dark:bg-neutral-900"
          />
        </div>
        <div>
          <label className="block text-sm">Top N</label>
          <input
            type="number"
            value={topN}
            onChange={(e) => setTopN(parseInt(e.target.value) || 0)}
            className="w-24 rounded-md border px-3 py-2 dark:bg-neutral-900"
          />
        </div>
      </div>
      <button
        onClick={handleSuggest}
        className="rounded-md bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
      >
        Get suggestions
      </button>
    </main>
  );
}

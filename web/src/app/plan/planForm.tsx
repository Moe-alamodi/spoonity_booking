"use client";
import { useState } from "react";

type Suggestion = { start: string; end: string; score: number };

export default function PlanForm({ organizerEmail }: { organizerEmail: string }) {
  const [participantEmail, setParticipantEmail] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  async function onSuggest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuggestions([]);
    try {
      const res = await fetch("/api/plan/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizerEmail,
          participantEmail,
          durationMinutes: 30,
          stepMinutes: 30,
          windowDays: 7,
          minNoticeHours: 2,
          fallbackStartHour: 8,
          fallbackEndHour: 17,
          excludeWeekends: true,
        }),
      });
      const json: { suggestions?: Suggestion[] } = await res.json();
      setSuggestions(json.suggestions ?? []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSuggest} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Participant email</label>
        <input
          type="email"
          required
          value={participantEmail}
          onChange={(e) => setParticipantEmail(e.target.value)}
          className="w-full rounded border px-3 py-2 bg-white dark:bg-neutral-900"
          placeholder="user@spoonity.com"
        />
      </div>
      <button
        type="submit"
        className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Finding suggestions..." : "Suggest times"}
      </button>

      {suggestions.length > 0 && (
        <div className="mt-6 space-y-2">
          <h2 className="text-lg font-semibold">Top suggestions</h2>
          <ul className="space-y-2">
            {suggestions.map((s, i) => (
              <li key={i} className="border rounded p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{new Date(s.start).toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Score: {s.score}</div>
                </div>
                <form action="/api/meetings/book" method="post">
                  <input type="hidden" name="organizerEmail" value={organizerEmail} />
                  <input type="hidden" name="participantEmail" value={participantEmail} />
                  <input type="hidden" name="start" value={s.start} />
                  <input type="hidden" name="durationMinutes" value={30} />
                  <button type="submit" className="bg-blue-600 text-white rounded px-3 py-2">Book</button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}


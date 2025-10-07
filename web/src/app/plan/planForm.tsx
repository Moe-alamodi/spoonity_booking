"use client";
import { useState } from "react";

type Suggestion = {
  start: string;
  end: string;
  score: number;
  provisional?: boolean;
};

export default function PlanForm({
  organizerEmail,
}: {
  organizerEmail: string;
}) {
  const [participantEmail, setParticipantEmail] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<{
    type: "success" | "error";
    message: string;
    meetLink?: string;
  } | null>(null);

  async function onSuggest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuggestions([]);
    setBookingStatus(null);
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

  async function onBook(suggestion: Suggestion) {
    setBookingStatus(null);
    try {
      const res = await fetch("/api/meetings/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizerEmail,
          participantEmail,
          start: suggestion.start,
          durationMinutes: 30,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setBookingStatus({
          type: "success",
          message: "Meeting booked successfully!",
          meetLink: json.meetLink,
        });
        // Clear suggestions after successful booking
        setSuggestions([]);
      } else {
        setBookingStatus({
          type: "error",
          message: json.error || "Failed to book meeting",
        });
      }
    } catch (error) {
      setBookingStatus({
        type: "error",
        message: "Failed to book meeting. Please try again.",
      });
    }
  }

  return (
    <form onSubmit={onSuggest} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Participant email
        </label>
        <div className="relative">
          <input
            type="email"
            required
            value={participantEmail}
            onChange={(e) => setParticipantEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-0 transition-colors duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="user@spoonity.com"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              />
            </svg>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:shadow-lg"
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Finding suggestions...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            Suggest times
          </div>
        )}
      </button>

      {bookingStatus && (
        <div
          className={`p-6 rounded-2xl border-2 shadow-lg animate-fade-in-up ${
            bookingStatus.type === "success"
              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700 dark:text-green-200"
              : "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800 dark:from-red-900/20 dark:to-rose-900/20 dark:border-red-700 dark:text-red-200"
          }`}
        >
          <div className="flex items-start">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                bookingStatus.type === "success"
                  ? "bg-green-100 dark:bg-green-800"
                  : "bg-red-100 dark:bg-red-800"
              }`}
            >
              {bookingStatus.type === "success" ? (
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-lg mb-2">
                {bookingStatus.message}
              </p>
              {bookingStatus.meetLink && (
                <a
                  href={bookingStatus.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Join Google Meet
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="mt-8 space-y-4 animate-fade-in-up">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Top suggestions
            </h2>
            <div className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Toronto timezone (America/Toronto)
            </div>
          </div>

          <div className="grid gap-4">
            {suggestions.map((s, i) => {
              const startDate = new Date(s.start);
              const endDate = new Date(s.end);
              const isProvisional = s.provisional ?? true;

              return (
                <div
                  key={i}
                  className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="font-bold text-lg text-gray-900 dark:text-white">
                            {startDate.toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                              timeZone: "America/Toronto",
                            })}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            {startDate.toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                              timeZone: "America/Toronto",
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {Math.round(
                            (endDate.getTime() - startDate.getTime()) /
                              (1000 * 60)
                          )}{" "}
                          min
                        </div>
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                          Score: {s.score}
                        </div>
                        {isProvisional && (
                          <div className="flex items-center text-orange-600 dark:text-orange-400">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                              />
                            </svg>
                            Provisional
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onBook(s)}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        isProvisional
                          ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                      }`}
                      disabled={isProvisional}
                    >
                      {isProvisional ? (
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Provisional
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Book Now
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </form>
  );
}

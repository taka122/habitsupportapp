"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type HistoryItem = {
  date: string;
  label: string;
  completed: boolean;
};

type HistoryResponse = {
  history: HistoryItem[];
  stats: {
    completedDays: number;
    totalDays: number;
    streak: number;
  };
};

export default function HistoryPage() {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/history");
        if (!res.ok) {
          throw new Error("履歴の取得に失敗しました。");
        }
        const json = (await res.json()) as HistoryResponse;
        setData(json);
      } catch (err) {
        console.error(err);
        setError("履歴の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  const progressLabel = data
    ? `${data.stats.completedDays}/${data.stats.totalDays}`
    : "--";

  return (
    <main className="min-h-screen px-6 py-10 text-white">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-gray-400">
              HISTORY
            </p>
            <h1 className="text-3xl font-semibold mt-2">履歴</h1>
          </div>
          <Link
            href="/"
            className="rounded-full border border-[#3B82F6] px-4 py-2 text-sm text-[#3B82F6] transition hover:bg-[#3B82F6] hover:text-white"
          >
            ← 今日へ戻る
          </Link>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <StatCard label="過去7日達成率" value={progressLabel} />
          <StatCard
            label="現在のストリーク"
            value={`${data?.stats.streak ?? 0}日`}
          />
        </section>

        <section
          className="rounded-3xl border border-[#2d2d2d] bg-[#1E1E1E] p-6 shadow-inner"
          aria-live="polite"
        >
          <h2 className="text-lg font-semibold mb-4">過去7日ログ</h2>

          {loading && (
            <div className="animate-pulse text-gray-500">読み込み中...</div>
          )}

          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          {!loading && !error && (
            <ul className="space-y-3">
              {data?.history.map((item) => (
                <li
                  key={item.date}
                  className="flex items-center justify-between rounded-2xl border border-[#2a2a2a] bg-[#151515] px-4 py-3"
                >
                  <span className="text-gray-300">{item.label}</span>
                  <span
                    className={`text-xl ${
                      item.completed ? "text-[#3B82F6]" : "text-gray-500"
                    }`}
                  >
                    {item.completed ? "✔" : "✖"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

type StatCardProps = {
  label: string;
  value: string;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-[#2d2d2d] bg-[#1E1E1E] px-6 py-5 text-center shadow-inner">
      <p className="text-xs uppercase tracking-[0.35em] text-gray-500">
        {label}
      </p>
      <p className="mt-4 text-3xl font-semibold">{value}</p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type HabitPayload = {
  id: string;
  name: string;
  streak: number;
  exp: number;
  color: string;
};

type RecordPayload = {
  id: string;
  completed: boolean;
  date: string;
};

type TodayResponse = {
  habit: HabitPayload;
  record: RecordPayload;
};

export default function Home() {
  const [data, setData] = useState<TodayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completed = data?.record.completed ?? false;

  const fetchToday = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/today");
      if (!res.ok) throw new Error("データの取得に失敗しました。");
      const json = (await res.json()) as TodayResponse;
      setData(json);
    } catch (err) {
      console.error(err);
      setError("データの読み込みに失敗しました。");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  const handleComplete = async () => {
    if (completed) {
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/complete", {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("達成処理に失敗しました。");
      }
      const json = (await res.json()) as TodayResponse;
      setData(json);
    } catch (err) {
      console.error(err);
      setError("達成処理に失敗しました。");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-10 text-white">
      <div className="w-full max-w-xl space-y-8">
        <header className="text-center space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-400">
            HABIT TRACKER
          </p>
          <h1 className="text-3xl font-semibold">全身筋トレ10分</h1>
          <p className="text-gray-400 text-sm">
            1タップで今日の筋トレを記録しましょう。
          </p>
        </header>

        <section
          className={`rounded-3xl border px-8 py-10 text-center transition-all duration-500 ${
            completed
              ? "border-[#3B82F6] card-glow"
              : "border-[#2d2d2d] shadow-inner"
          }`}
          style={{ backgroundColor: "#1E1E1E" }}
        >
          {loading ? (
            <div className="animate-pulse text-gray-500">読み込み中...</div>
          ) : (
            <>
              <p className="text-sm uppercase tracking-[0.4em] text-gray-500 mb-3">
                今日の習慣
              </p>
              <h2 className="text-2xl font-semibold mb-6">
                {data?.habit.name ?? "全身筋トレ10分"}
              </h2>
              <button
                type="button"
                onClick={handleComplete}
                disabled={actionLoading || completed}
                className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold transition-colors ${
                  completed
                    ? "bg-[#3B82F6] text-white"
                    : "border border-[#3B82F6] text-[#3B82F6]"
                } ${actionLoading ? "opacity-70" : ""}`}
              >
                {completed ? "✔" : "GO"}
              </button>
              <p className="mt-6 text-sm text-gray-400">
                {completed
                  ? "お疲れさまです！今日も筋トレ達成。"
                  : "タップして今日の筋トレを完了しましょう"}
              </p>
              {error && (
                <p className="mt-4 text-sm text-red-400" role="alert">
                  {error}
                </p>
              )}
            </>
          )}
        </section>

        <section className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
          <MetricCard
            title="連続達成日数"
            value={`${data?.habit.streak ?? 0}日`}
          />
          <MetricCard
            title="今日の達成"
            value={`${completed ? 1 : 0}/1`}
          />
          <MetricCard title="EXP" value={`${data?.habit.exp ?? 0}`} />
        </section>

        <div className="flex justify-center">
          <Link
            href="/history"
            className="inline-flex items-center gap-2 rounded-full border border-[#3B82F6] px-6 py-2 text-sm text-[#3B82F6] transition hover:bg-[#3B82F6] hover:text-white"
          >
            履歴を見る →
          </Link>
        </div>
      </div>
    </main>
  );
}

type MetricProps = {
  title: string;
  value: string;
};

function MetricCard({ title, value }: MetricProps) {
  return (
    <div
      className="rounded-2xl border border-[#2d2d2d] bg-[#1E1E1E] px-4 py-5 text-center shadow-inner"
      style={{ minHeight: 96 }}
    >
      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{title}</p>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}

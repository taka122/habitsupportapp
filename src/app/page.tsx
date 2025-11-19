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

type RoutineTip = {
  name: string;
  sets: string;
  notes: string[];
};

type RoutineSection = {
  title: string;
  exercises: RoutineTip[];
};

const routineSections: RoutineSection[] = [
  {
    title: "🔥 下半身（静音メニュー）",
    exercises: [
      {
        name: "① ダンベルスクワット",
        sets: "10〜15回 × 3セット",
        notes: ["静かにしゃがむ・ゆっくり立つ", "お尻と太もも全体を強化"],
      },
      {
        name: "② ダンベルデッドリフト",
        sets: "10〜12回 × 3セット",
        notes: ["背中を丸めず前傾", "もも裏・お尻・背中まで一気に鍛える"],
      },
      {
        name: "③ ダンベルランジ（前に出すだけでOK）",
        sets: "左右10回 × 2セット",
        notes: ["ゆっくり足を出せば音は出ない", "下半身のバランス力アップ"],
      },
    ],
  },
  {
    title: "🫀 胸・肩・腕・背中（上半身）",
    exercises: [
      {
        name: "④ ダンベルフロアプレス（床で胸の筋トレ）",
        sets: "12回 × 3セット",
        notes: ["ベンチ不要", "胸と腕の前側を鍛える"],
      },
      {
        name: "⑤ ダンベルワンハンドロウ",
        sets: "左右10〜12回 × 3セット",
        notes: ["イスに手を置いて安定", "背中がしっかり引き締まる"],
      },
      {
        name: "⑥ サイドレイズ（肩）",
        sets: "12〜15回 × 3セット",
        notes: ["軽い重量でOK", "肩の丸みが作れる"],
      },
      {
        name: "⑦ ダンベルカール（力こぶ）",
        sets: "10〜15回 × 3セット",
        notes: ["反動なしでゆっくり持ち上げる"],
      },
      {
        name: "⑧ ダンベルトライセプスエクステンション（腕裏）",
        sets: "10〜12回 × 3セット",
        notes: ["二の腕の裏を引き締める"],
      },
    ],
  },
  {
    title: "🔥 腹筋（音ゼロ）",
    exercises: [
      {
        name: "⑨ ダンベルクランチ",
        sets: "12回 × 2〜3セット",
        notes: ["ダンベルを胸に抱える", "上腹に効く"],
      },
      {
        name: "⑩ ダンベルレッグレイズ",
        sets: "10回 × 2〜3セット",
        notes: ["ダンベルを足首や膝で挟む", "下腹にしっかり効く"],
      },
      {
        name: "⑪ ダンベルサイドベント",
        sets: "左右10回 × 2セット",
        notes: ["立ったまま横に倒すだけ", "くびれを作る"],
      },
      {
        name: "⑫ ダンベルデッドバグ",
        sets: "12回 × 2セット",
        notes: ["仰向けで対角の腕と足を伸ばす", "お腹の奥（インナー）が鍛えられる"],
      },
      {
        name: "⑬ ロシアンツイスト（静音バージョン）",
        sets: "左右20回 × 2セット",
        notes: ["足を床につけたまま", "ゆっくり左右にひねる"],
      },
    ],
  },
];

export default function Home() {
  const [data, setData] = useState<TodayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRoutine, setShowRoutine] = useState(false);

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
    <>
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

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => setShowRoutine(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3B82F6] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2563eb]"
          >
            スタート（メニュー表示）
          </button>
          <Link
            href="/history"
            className="inline-flex items-center gap-2 rounded-full border border-[#3B82F6] px-6 py-3 text-sm text-[#3B82F6] transition hover:bg-[#3B82F6] hover:text-white"
          >
            履歴を見る →
          </Link>
        </div>
        </div>
      </main>
      {showRoutine && <RoutineModal onClose={() => setShowRoutine(false)} />}
    </>
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

function RoutineModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl border border-[#3B82F6]/30 bg-[#0f172a] shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-[#0a1120]/80 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[#3B82F6]">Routine</p>
            <h2 className="text-xl font-semibold text-white">静音・フルボディ筋トレメニュー</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/20 px-4 py-1 text-sm text-white transition hover:border-white hover:bg-white/10"
          >
            閉じる
          </button>
        </div>
        <div className="space-y-8 overflow-y-auto px-6 py-6">
          {routineSections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4"
            >
              <h3 className="text-lg font-semibold text-white">{section.title}</h3>
              <div className="mt-4 space-y-4">
                {section.exercises.map((exercise) => (
                  <div
                    key={exercise.name}
                    className="rounded-xl border border-white/10 bg-black/30 px-4 py-3"
                  >
                    <div className="flex flex-col gap-1 text-white">
                      <p className="font-semibold">{exercise.name}</p>
                      <p className="text-sm text-[#3B82F6]">{exercise.sets}</p>
                    </div>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-200">
                      {exercise.notes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

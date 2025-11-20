"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type WorkoutStep = {
  name: string;
  duration: number;
  description: string;
};

const workouts: WorkoutStep[] = [
  { name: "ダンベルスクワット", duration: 240, description: "ダンベルを持ってしゃがんで立つ動作。太もも・お尻に効く。" },
  { name: "ダンベルデッドリフト", duration: 240, description: "前屈みから起き上がる動作。もも裏・お尻・背中に効く。" },
  { name: "ダンベルランジ", duration: 240, description: "足を前に出してしゃがむ。下半身と体幹に効く。" },
  { name: "フロアプレス", duration: 240, description: "仰向けでダンベルを押し上げる。胸に効く。" },
  { name: "ワンハンドロウ", duration: 300, description: "片手で体を支え、もう一方でダンベルを引く。背中に効く。" },
  { name: "サイドレイズ", duration: 180, description: "腕を横に上げる。肩の丸みを作る。" },
  { name: "ダンベルカール", duration: 120, description: "肘を曲げて持ち上げる。力こぶに効く。" },
  { name: "トライセプス", duration: 120, description: "頭上でダンベルを上下する。二の腕裏に効く。" },
  { name: "ダンベルクランチ", duration: 120, description: "上体を少し起こす。上腹に効く。" },
  { name: "レッグレイズ", duration: 180, description: "足を伸ばして上下する。下腹に効く。" },
  { name: "サイドベント", duration: 120, description: "体を横に倒す。脇腹とくびれに効く。" },
  { name: "デッドバグ", duration: 120, description: "手足を交互に伸ばす。体幹に効く。" },
  { name: "ロシアンツイスト", duration: 120, description: "ダンベルを持って左右にひねる。腹斜筋に効く。" },
];

type WorkoutStatus = "idle" | "running" | "finished";

export default function Home() {
  const [status, setStatus] = useState<WorkoutStatus>("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remaining, setRemaining] = useState(workouts[0].duration);

  const currentWorkout = workouts[currentIndex];
  const isRunning = status === "running";
  const isFinished = status === "finished";

  const advanceStep = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev + 1 < workouts.length) {
        const next = prev + 1;
        setRemaining(workouts[next].duration);
        return next;
      }
      setStatus("finished");
      setRemaining(0);
      return prev;
    });
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    if (remaining > 0) return;
    advanceStep();
  }, [remaining, isRunning, advanceStep]);

  const handleStart = () => {
    if (status !== "idle") return;
    setCurrentIndex(0);
    setRemaining(workouts[0].duration);
    setStatus("running");
  };

  const handleReset = () => {
    setStatus("idle");
    setCurrentIndex(0);
    setRemaining(workouts[0].duration);
  };

  const formattedTime = useMemo(() => formatTime(remaining), [remaining]);
  const displayTitle = isFinished
    ? "すべて終了！お疲れさま！"
    : isRunning
      ? `${currentIndex + 1}. ${currentWorkout.name}`
      : "準備完了";

  const displayDescription = isFinished
    ? "いい汗をかきました！水分補給を忘れずに。"
    : isRunning
      ? currentWorkout.description
      : "スタートを押すとワークアウトが始まります。";

  const totalSteps = workouts.length;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-4 py-10">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-500">全身ワークアウトプログラム</p>
          <h1 className="text-2xl font-semibold text-gray-900">ダンベルコンディショニング</h1>
        </div>

        <div className="flex flex-col items-center gap-6 text-center">
          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-900">{displayTitle}</p>
            {!isFinished && isRunning && (
              <p className="text-sm text-gray-500">
                残りメニュー {currentIndex + 1} / {totalSteps}
              </p>
            )}
          </div>

          <div className="text-5xl font-bold text-gray-900">{formattedTime}</div>

          <p className="text-base text-gray-600">{displayDescription}</p>

          {isRunning && currentIndex + 1 < totalSteps && (
            <p className="text-sm text-gray-400">
              次: {currentIndex + 2}. {workouts[currentIndex + 1].name}
            </p>
          )}

          <button
            type="button"
            disabled={status !== "idle"}
            onClick={handleStart}
            className={`w-full rounded-full px-6 py-3 text-sm font-semibold transition ${
              status === "idle"
                ? "bg-[#3B82F6] text-white hover:bg-[#2563EB]"
                : "cursor-not-allowed bg-gray-300 text-gray-500"
            }`}
          >
            {status === "idle" ? "スタート" : "進行中"}
          </button>

          {isFinished && (
            <button
              type="button"
              onClick={handleReset}
              className="w-full rounded-full border border-[#3B82F6] px-6 py-3 text-sm font-semibold text-[#3B82F6] transition hover:bg-[#3B82F6] hover:text-white"
            >
              もう一度チャレンジ
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const m = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
  const s = String(safeSeconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

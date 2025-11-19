import { NextResponse } from "next/server";
import {
  ensureRecordForDate,
  ensureUserAndHabit,
  getDayRange,
} from "@/lib/habit";
import prisma from "@/lib/prisma";

const DAYS = 7;

export async function GET() {
  try {
    const { habit } = await ensureUserAndHabit();
    await ensureRecordForDate(habit.id);

    const today = new Date();
    const { start } = getDayRange(today);
    const rangeStart = new Date(start);
    rangeStart.setDate(rangeStart.getDate() - (DAYS - 1));
    const rangeEnd = new Date(start);
    rangeEnd.setDate(rangeEnd.getDate() + 1);

    const records = await prisma.record.findMany({
      where: {
        habitId: habit.id,
        date: {
          gte: rangeStart,
          lt: rangeEnd,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    const recordMap = new Map<string, boolean>();
    records.forEach((record) => {
      const key = new Date(record.date).toISOString().split("T")[0];
      recordMap.set(key, record.completed);
    });

    const history = Array.from({ length: DAYS }).map((_, index) => {
      const date = new Date(start);
      date.setDate(date.getDate() - index);
      const key = date.toISOString().split("T")[0];

      return {
        date: key,
        label: date.toLocaleDateString("ja-JP", {
          month: "2-digit",
          day: "2-digit",
          weekday: "short",
        }),
        completed: recordMap.get(key) ?? false,
      };
    });

    const completedDays = history.filter((day) => day.completed).length;

    return NextResponse.json({
      history,
      stats: {
        completedDays,
        totalDays: DAYS,
        streak: habit.streak,
      },
    });
  } catch (error) {
    console.error("[GET /api/history]", error);
    return NextResponse.json(
      { error: "履歴を取得できませんでした。" },
      { status: 500 },
    );
  }
}

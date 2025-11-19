import { NextResponse } from "next/server";
import {
  ensureUserAndHabit,
  ensureRecordForDate,
  HABIT_NAME,
} from "@/lib/habit";

export async function GET() {
  try {
    const { habit } = await ensureUserAndHabit();
    const record = await ensureRecordForDate(habit.id);

    return NextResponse.json({
      habit: {
        id: habit.id,
        name: HABIT_NAME,
        streak: habit.streak,
        exp: habit.exp,
        color: habit.color,
      },
      record,
    });
  } catch (error) {
    console.error("[GET /api/today]", error);
    return NextResponse.json(
      { error: "今日の記録を取得できませんでした。" },
      { status: 500 },
    );
  }
}

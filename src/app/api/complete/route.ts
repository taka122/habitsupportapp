import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureRecordForDate, ensureUserAndHabit, getDayRange } from "@/lib/habit";

export async function POST() {
  try {
    const { habit } = await ensureUserAndHabit();
    const record = await ensureRecordForDate(habit.id);

    if (record.completed) {
      return NextResponse.json({
        habit: {
          id: habit.id,
          name: habit.name,
          streak: habit.streak,
          exp: habit.exp,
          color: habit.color,
        },
        record,
        message: "今日の習慣はすでに達成済みです。",
      });
    }

    const { start } = getDayRange(new Date());
    const previousStart = new Date(start);
    previousStart.setDate(previousStart.getDate() - 1);
    const previousEnd = new Date(start);

    const previousRecord = await prisma.record.findFirst({
      where: {
        habitId: habit.id,
        date: {
          gte: previousStart,
          lt: previousEnd,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    const previousCompleted = previousRecord?.completed ?? false;
    const nextStreak = previousCompleted ? habit.streak + 1 : 1;

    const result = await prisma.$transaction(async (tx) => {
      const updatedRecord = await tx.record.update({
        where: { id: record.id },
        data: { completed: true },
      });

      const updatedHabit = await tx.habit.update({
        where: { id: habit.id },
        data: {
          streak: nextStreak,
          exp: habit.exp + 10,
        },
      });

      return { updatedRecord, updatedHabit };
    });

    return NextResponse.json({
      habit: {
        id: result.updatedHabit.id,
        name: result.updatedHabit.name,
        streak: result.updatedHabit.streak,
        exp: result.updatedHabit.exp,
        color: result.updatedHabit.color,
      },
      record: result.updatedRecord,
    });
  } catch (error) {
    console.error("[POST /api/complete]", error);
    return NextResponse.json(
      { error: "達成処理に失敗しました。" },
      { status: 500 },
    );
  }
}

import prisma from "./prisma";

const HABIT_NAME = "全身筋トレ10分";
const DEFAULT_USER_NAME = "筋トレユーザー";

export function getDayRange(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

export async function ensureUserAndHabit() {
  let user = await prisma.user.findFirst();

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: DEFAULT_USER_NAME,
      },
    });
  }

  let habit = await prisma.habit.findFirst({
    where: {
      userId: user.id,
    },
  });

  if (!habit) {
    habit = await prisma.habit.create({
      data: {
        userId: user.id,
        name: HABIT_NAME,
        type: "time",
        duration: 10,
        frequency: "daily",
        color: "blue",
      },
    });
  }

  return { user, habit };
}

export async function ensureRecordForDate(habitId: string, date = new Date()) {
  const { start, end } = getDayRange(date);

  let record = await prisma.record.findFirst({
    where: {
      habitId,
      date: {
        gte: start,
        lt: end,
      },
    },
  });

  if (!record) {
    record = await prisma.record.create({
      data: {
        habitId,
        date: start,
        completed: false,
      },
    });
  }

  return record;
}

export { HABIT_NAME };

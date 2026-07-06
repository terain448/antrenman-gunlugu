export function toDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createDateFromKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(dateKey, amount) {
  const date = createDateFromKey(dateKey);
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
}

export function getDaysBetween(startDate, endDate = new Date()) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const difference = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(difference / 86_400_000));
}

export function getWeekDays() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + mondayOffset + index);
    return {
      key: toDateKey(date),
      label: date.toLocaleDateString("tr-TR", { weekday: "short" }),
    };
  });
}

export function getCurrentMonthWeeks() {
  const monthDays = getMonthDays();
  const weeks = [];

  monthDays.forEach((dateKey) => {
    const date = createDateFromKey(dateKey);
    const weekIndex = Math.floor((date.getDate() - 1) / 7);

    if (!weeks[weekIndex]) {
      weeks[weekIndex] = {
        label: `${weekIndex + 1}. Hafta`,
        days: [],
      };
    }

    weeks[weekIndex].days.push(dateKey);
  });

  return weeks;
}

export function formatDisplayDate(dateKey) {
  return createDateFromKey(dateKey).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
  });
}

export function formatLongDate(dateKey) {
  return createDateFromKey(dateKey).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatMonthYear(date) {
  return date.toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });
}

export function getMonthDays(date = new Date()) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const totalDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  return Array.from({ length: totalDays }, (_, index) => {
    const day = new Date(firstDay);
    day.setDate(index + 1);
    return toDateKey(day);
  });
}

export function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

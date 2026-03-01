export function formatDateApi(date: Date): string {
  const dd = date.getDate().toString().padStart(2, "0");
  const mm = (date.getMonth() + 1).toString().padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function formatDateLabel(date: Date): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
}

interface DateOption {
  title: string;
  value: string; // ISO date string
}

export function generateDateOptions(count: number): DateOption[] {
  const options: DateOption[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const label = formatDateLabel(date);
    let title: string;
    if (i === 0) title = `Today - ${label}`;
    else if (i === 1) title = `Tomorrow - ${label}`;
    else title = label;

    options.push({ title, value: date.toISOString() });
  }

  return options;
}

export function generateWeekDates(): Date[] {
  const dates: Date[] = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }

  return dates;
}

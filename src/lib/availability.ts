import { Reservation, TimeSlot, DayAvailability } from "./types";
import { formatDateApi, formatDateLabel } from "./dates";

const SLOT_START = 7;
const SLOT_END = 22;

function getPrice(hour: number): number {
  return hour < 18 ? 450 : 600;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function computeDaySlots(date: Date, reservations: Reservation[]): DayAvailability {
  const dateApi = formatDateApi(date);
  const dayReservations = reservations.filter((r) => r.reservDate === dateApi);

  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const slots: TimeSlot[] = [];

  for (let hour = SLOT_START; hour < SLOT_END; hour++) {
    const startTime = `${pad(hour)}:00`;
    const endTime = `${pad(hour + 1)}:00`;

    let status: TimeSlot["status"] = "available";

    if (isToday && (hour + 1 < currentHour || (hour + 1 === currentHour && currentMinute > 0))) {
      status = "past";
    } else {
      const isBooked = dayReservations.some((r) => r.startTime < endTime && r.endTime > startTime);
      if (isBooked) {
        status = "booked";
      }
    }

    slots.push({ startTime, endTime, status, price: getPrice(hour) });
  }

  const availableCount = slots.filter((s) => s.status === "available").length;

  return {
    date,
    dateLabel: formatDateLabel(date),
    dateApi,
    slots,
    availableCount,
    totalCount: slots.length,
  };
}

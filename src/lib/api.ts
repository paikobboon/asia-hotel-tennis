import { Reservation } from "./types";

export const API_URL = "http://tennis.asiagrouponline.com:5300/api/calendar";
export const BOOKING_URL = "http://tennis.asiagrouponline.com:5300/calendar";

export function parseReservations(data: unknown): Reservation[] {
  if (!Array.isArray(data)) return [];
  return data.filter(
    (item): item is Reservation =>
      typeof item === "object" &&
      item !== null &&
      typeof item.reservDate === "string" &&
      typeof item.startTime === "string" &&
      typeof item.endTime === "string",
  );
}

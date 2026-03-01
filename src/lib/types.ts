export interface Reservation {
  _id: string;
  reservDate: string; // DD/MM/YYYY
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface TimeSlot {
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: "available" | "booked" | "past";
  price: number;
}

export interface DayAvailability {
  date: Date;
  dateLabel: string;
  dateApi: string; // DD/MM/YYYY
  slots: TimeSlot[];
  availableCount: number;
  totalCount: number;
}

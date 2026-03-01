import { List, Icon, Color, ActionPanel, Action } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { API_URL, BOOKING_URL, parseReservations } from "./lib/api";
import { computeDaySlots } from "./lib/availability";
import { generateWeekDates } from "./lib/dates";

export default function FindAvailable() {
  const { data, isLoading } = useFetch(API_URL, {
    parseResponse: async (response) => {
      const json = await response.json();
      return parseReservations(json);
    },
  });

  const reservations = data ?? [];
  const weekDates = generateWeekDates();
  const days = weekDates.map((date) => computeDaySlots(date, reservations));

  return (
    <List isLoading={isLoading}>
      {days.map((day) => {
        const availableSlots = day.slots.filter((s) => s.status === "available");

        if (availableSlots.length === 0) {
          return (
            <List.Section key={day.dateApi} title={day.dateLabel} subtitle="No available slots">
              <List.Item
                icon={{ source: Icon.XMarkCircle, tintColor: Color.SecondaryText }}
                title="Fully booked"
                subtitle="No available time slots"
              />
            </List.Section>
          );
        }

        return (
          <List.Section
            key={day.dateApi}
            title={day.dateLabel}
            subtitle={`${availableSlots.length} slot${availableSlots.length !== 1 ? "s" : ""} available`}
          >
            {availableSlots.map((slot) => (
              <List.Item
                key={`${day.dateApi}-${slot.startTime}`}
                icon={{ source: Icon.CheckCircle, tintColor: Color.Green }}
                title={`${slot.startTime} - ${slot.endTime}`}
                accessories={[
                  {
                    tag: {
                      value: `${slot.price} THB`,
                      color: slot.price === 450 ? Color.Blue : Color.Orange,
                    },
                  },
                ]}
                actions={
                  <ActionPanel>
                    <Action.OpenInBrowser title="Open Booking Website" url={BOOKING_URL} />
                    <Action.CopyToClipboard
                      title="Copy Slot Info"
                      shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                      content={`${day.dateLabel} ${slot.startTime}-${slot.endTime}: Available (${slot.price} THB/hr)`}
                    />
                  </ActionPanel>
                }
              />
            ))}
          </List.Section>
        );
      })}
    </List>
  );
}

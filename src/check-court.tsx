import { List, Icon, Color, ActionPanel, Action } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useState } from "react";
import { API_URL, BOOKING_URL, parseReservations } from "./lib/api";
import { computeDaySlots } from "./lib/availability";
import { generateDateOptions } from "./lib/dates";
import { TimeSlot } from "./lib/types";

const dateOptions = generateDateOptions(14);

function slotIcon(slot: TimeSlot): { source: Icon; tintColor: Color } {
  if (slot.status === "past") return { source: Icon.Clock, tintColor: Color.SecondaryText };
  if (slot.status === "booked") return { source: Icon.XMarkCircle, tintColor: Color.Red };
  return { source: Icon.CheckCircle, tintColor: Color.Green };
}

function slotStatusText(slot: TimeSlot): string {
  if (slot.status === "past") return "Past";
  if (slot.status === "booked") return "Booked";
  return "Available";
}

function slotAccessory(slot: TimeSlot): List.Item.Accessory[] {
  return [
    {
      tag: {
        value: `${slot.price} THB`,
        color: slot.price === 450 ? Color.Blue : Color.Orange,
      },
    },
  ];
}

function SlotItem({
  slot,
  dateLabel,
  filter,
  onFilterChange,
}: {
  slot: TimeSlot;
  dateLabel: string;
  filter: Filter;
  onFilterChange: (f: Filter) => void;
}) {
  return (
    <List.Item
      key={slot.startTime}
      icon={slotIcon(slot)}
      title={`${slot.startTime} - ${slot.endTime}`}
      subtitle={slotStatusText(slot)}
      accessories={slotAccessory(slot)}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser title="Open Booking Website" url={BOOKING_URL} />
          <Action
            title={filter === "all" ? "Show Available Only" : "Show All Slots"}
            icon={filter === "all" ? Icon.Filter : Icon.List}
            shortcut={{ modifiers: ["cmd", "shift"], key: "f" }}
            onAction={() => onFilterChange(filter === "all" ? "available" : "all")}
          />
          <Action.CopyToClipboard
            title="Copy Slot Info"
            shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
            content={`${dateLabel} ${slot.startTime}-${slot.endTime}: ${slotStatusText(slot)} (${slot.price} THB/hr)`}
          />
        </ActionPanel>
      }
    />
  );
}

type Filter = "all" | "available";

export default function CheckCourt() {
  const [selectedDate, setSelectedDate] = useState(dateOptions[0].value);
  const [filter, setFilter] = useState<Filter>("all");

  const { data, isLoading } = useFetch(API_URL, {
    parseResponse: async (response) => {
      const json = await response.json();
      return parseReservations(json);
    },
  });

  const reservations = data ?? [];
  const date = new Date(selectedDate);
  const day = computeDaySlots(date, reservations);

  const visibleSlots = filter === "available" ? day.slots.filter((s) => s.status === "available") : day.slots;

  const morning = visibleSlots.filter((s) => s.startTime < "12:00");
  const afternoon = visibleSlots.filter((s) => s.startTime >= "12:00" && s.startTime < "18:00");
  const evening = visibleSlots.filter((s) => s.startTime >= "18:00");

  function sectionSubtitle(slots: TimeSlot[]) {
    const avail = slots.filter((s) => s.status === "available").length;
    return `${avail} of ${slots.length} available`;
  }

  return (
    <List
      isLoading={isLoading}
      searchBarAccessory={
        <List.Dropdown tooltip="Select Date" value={selectedDate} onChange={setSelectedDate}>
          {dateOptions.map((opt) => (
            <List.Dropdown.Item key={opt.value} title={opt.title} value={opt.value} />
          ))}
        </List.Dropdown>
      }
    >
      {morning.length > 0 && (
        <List.Section title="Morning  07:00–12:00" subtitle={sectionSubtitle(morning)}>
          {morning.map((slot) => (
            <SlotItem
              key={slot.startTime}
              slot={slot}
              dateLabel={day.dateLabel}
              onFilterChange={setFilter}
              filter={filter}
            />
          ))}
        </List.Section>
      )}
      {afternoon.length > 0 && (
        <List.Section title="Afternoon  12:00–18:00" subtitle={sectionSubtitle(afternoon)}>
          {afternoon.map((slot) => (
            <SlotItem
              key={slot.startTime}
              slot={slot}
              dateLabel={day.dateLabel}
              onFilterChange={setFilter}
              filter={filter}
            />
          ))}
        </List.Section>
      )}
      {evening.length > 0 && (
        <List.Section title="Evening  18:00–22:00" subtitle={sectionSubtitle(evening)}>
          {evening.map((slot) => (
            <SlotItem
              key={slot.startTime}
              slot={slot}
              dateLabel={day.dateLabel}
              onFilterChange={setFilter}
              filter={filter}
            />
          ))}
        </List.Section>
      )}
    </List>
  );
}

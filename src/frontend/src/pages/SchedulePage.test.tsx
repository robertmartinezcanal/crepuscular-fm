import { renderWithActor } from "@/__tests__/test-utils";
import type { ProgramSlot, backendInterface } from "@/backend";
import { Weekday } from "@/backend";
import SchedulePage from "@/pages/SchedulePage";
import { screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const SLOTS: ProgramSlot[] = [
  {
    weekday: Weekday.monday,
    startTime: "08:00",
    endTime: "10:00",
    name: "Mañana Crepuscular",
    description: "Música y noticias para empezar el día.",
  },
  {
    weekday: Weekday.monday,
    startTime: "10:00",
    endTime: "12:00",
    name: "Voces de la Comunidad",
    description: "Espacio de participación vecinal.",
  },
  {
    weekday: Weekday.wednesday,
    startTime: "18:00",
    endTime: "20:00",
    name: "Crepúsculo Musical",
    description: "Selección musical de la tarde.",
  },
];

function makeActor(
  slots: ProgramSlot[],
): Pick<backendInterface, "listSchedule"> {
  return {
    listSchedule: vi.fn(async () => structuredClone(slots)),
  };
}

describe("SchedulePage", () => {
  beforeEach(() => {
    // Monday 2024-05-13 at 09:00 local time: inside the first Monday slot.
    vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
    vi.setSystemTime(new Date(2024, 4, 13, 9, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the weekly grid with day and time for each program", async () => {
    renderWithActor(<SchedulePage />, makeActor(SLOTS));

    await waitFor(() => {
      expect(screen.getByTestId("schedule.day.monday")).toHaveTextContent(
        "Mañana Crepuscular",
      );
    });
    const monday = screen.getByTestId("schedule.day.monday");
    expect(monday).toHaveTextContent("Voces de la Comunidad");
    expect(monday).toHaveTextContent("08:00 – 10:00");
    const wednesday = screen.getByTestId("schedule.day.wednesday");
    expect(wednesday).toHaveTextContent("Crepúsculo Musical");
    expect(wednesday).toHaveTextContent("18:00 – 20:00");
  });

  it("highlights the program airing at the current local time", async () => {
    renderWithActor(<SchedulePage />, makeActor(SLOTS));

    await waitFor(() => {
      expect(screen.getByTestId("schedule.now_playing")).toHaveTextContent(
        "Mañana Crepuscular",
      );
    });
    // The live slot carries the "Al aire" badge; the other Monday slot does not.
    expect(screen.getByTestId("schedule.live_badge.1")).toHaveTextContent(
      "Al aire",
    );
    expect(
      screen.queryByTestId("schedule.live_badge.2"),
    ).not.toBeInTheDocument();
  });

  it("shows an empty state when the schedule has no programs", async () => {
    renderWithActor(<SchedulePage />, makeActor([]));

    await waitFor(() => {
      expect(screen.getByTestId("schedule.empty_state")).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId("schedule.now_playing"),
    ).not.toBeInTheDocument();
  });
});

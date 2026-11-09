import { renderWithActor } from "@/__tests__/test-utils";
import type { NewsItem, ProgramSlot, backendInterface } from "@/backend";
import { Weekday } from "@/backend";
import HomePage from "@/pages/HomePage";
import { Principal } from "@icp-sdk/core/principal";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const AUTHOR = Principal.fromText("aaaaa-aa");

function makeItem(id: bigint, title: string, publishedAt: bigint): NewsItem {
  return {
    id,
    title,
    body: `Cuerpo de ${title}.`,
    publishedAt,
    author: AUTHOR,
  };
}

const SLOT: ProgramSlot = {
  weekday: Weekday.monday,
  startTime: "08:00",
  endTime: "10:00",
  name: "Mañana Crepuscular",
  description: "Música y noticias para empezar el día.",
};

function makeActor(
  news: NewsItem[],
  schedule: ProgramSlot[],
): Pick<backendInterface, "listNews" | "listSchedule"> {
  return {
    listNews: vi.fn(async () =>
      news.map((item) => ({ ...item, author: Principal.from(item.author) })),
    ),
    listSchedule: vi.fn(async () => structuredClone(schedule)),
  };
}

function renderHome(
  actor: Pick<backendInterface, "listNews" | "listSchedule">,
) {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: HomePage,
  });
  const newsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/noticias",
    component: () => <div data-ocid="news.stub" />,
  });
  const detailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/noticias/$id",
    component: () => <div data-ocid="detail.stub" />,
  });
  const scheduleRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/programacion",
    component: () => <div data-ocid="schedule.stub" />,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([
      indexRoute,
      newsRoute,
      detailRoute,
      scheduleRoute,
    ]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  return renderWithActor(<RouterProvider router={router} />, actor);
}

describe("HomePage", () => {
  beforeEach(() => {
    // Monday 2024-05-13 at 09:00 local time: inside the Monday slot.
    vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
    vi.setSystemTime(new Date(2024, 4, 13, 9, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the main route without a blank screen", async () => {
    renderHome(makeActor([], []));

    await waitFor(() => {
      expect(screen.getByTestId("home.page")).toBeInTheDocument();
    });
    expect(
      screen.getByRole("heading", {
        name: "Sintoniza el Latido del Crepúsculo",
      }),
    ).toBeInTheDocument();
  });

  it("shows the program currently on air", async () => {
    renderHome(makeActor([], [SLOT]));

    await waitFor(() => {
      expect(screen.getByTestId("home.now_playing.section")).toHaveTextContent(
        "Mañana Crepuscular",
      );
    });
  });

  it("previews the most recent news", async () => {
    const older = makeItem(1n, "Comunicado antiguo", 1_000_000_000n);
    const newer = makeItem(2n, "Comunicado reciente", 2_000_000_000n);
    renderHome(makeActor([older, newer], []));

    await waitFor(() => {
      expect(screen.getByTestId("home.news.item.1")).toHaveTextContent(
        "Comunicado reciente",
      );
    });
    expect(screen.getByTestId("home.news.item.2")).toHaveTextContent(
      "Comunicado antiguo",
    );
  });

  it("shows an empty state when there are no news", async () => {
    renderHome(makeActor([], []));

    await waitFor(() => {
      expect(screen.getByTestId("home.news.empty_state")).toBeInTheDocument();
    });
  });
});

import { renderWithActor } from "@/__tests__/test-utils";
import type { NewsItem, backendInterface } from "@/backend";
import NewsPage from "@/pages/NewsPage";
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
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

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

function makeActor(items: NewsItem[]): Pick<backendInterface, "listNews"> {
  return {
    listNews: vi.fn(async () => structuredClone(items)),
  };
}

/** Mount a page inside a minimal memory router so `Link` has context. */
function renderInRouter(
  ui: ReactElement,
  actor: Pick<backendInterface, "listNews">,
) {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => ui,
  });
  const detailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/noticias/$id",
    component: () => <div data-ocid="detail.stub" />,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute, detailRoute]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  return renderWithActor(<RouterProvider router={router} />, actor);
}

describe("NewsPage", () => {
  it("lists published news newest first", async () => {
    const older = makeItem(1n, "Comunicado antiguo", 1_000_000_000n);
    const newer = makeItem(2n, "Comunicado reciente", 2_000_000_000n);
    renderInRouter(<NewsPage />, makeActor([older, newer]));

    await waitFor(() => {
      expect(screen.getByTestId("news.list")).toBeInTheDocument();
    });
    const items = screen.getAllByTestId(/^news\.item\./);
    expect(items[0]).toHaveTextContent("Comunicado reciente");
    expect(items[1]).toHaveTextContent("Comunicado antiguo");
  });

  it("shows an empty state when there are no published news", async () => {
    renderInRouter(<NewsPage />, makeActor([]));

    await waitFor(() => {
      expect(screen.getByTestId("news.empty_state")).toBeInTheDocument();
    });
  });
});

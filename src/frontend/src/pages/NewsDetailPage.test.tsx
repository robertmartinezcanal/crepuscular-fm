import { renderWithActor } from "@/__tests__/test-utils";
import type { NewsItem, backendInterface } from "@/backend";
import NewsDetailPage from "@/pages/NewsDetailPage";
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
import { describe, expect, it, vi } from "vitest";

const AUTHOR = Principal.fromText("aaaaa-aa");

const ITEM: NewsItem = {
  id: 7n,
  title: "Festival comunitario",
  body: "Primer párrafo del comunicado.\n\nSegundo párrafo con más detalles.",
  publishedAt: 1_700_000_000_000_000_000n,
  author: AUTHOR,
};

function makeActor(item: NewsItem | null): Pick<backendInterface, "getNews"> {
  return {
    getNews: vi.fn(async () => (item ? structuredClone(item) : null)),
  };
}

function renderDetail(id: string, actor: Pick<backendInterface, "getNews">) {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const detailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/noticias/$id",
    component: NewsDetailPage,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([detailRoute]),
    history: createMemoryHistory({ initialEntries: [`/noticias/${id}`] }),
  });
  return renderWithActor(<RouterProvider router={router} />, actor);
}

describe("NewsDetailPage", () => {
  it("renders the full news body split into paragraphs", async () => {
    renderDetail("7", makeActor(ITEM));

    await waitFor(() => {
      expect(screen.getByTestId("news_detail.page")).toBeInTheDocument();
    });
    expect(screen.getByText("Festival comunitario")).toBeInTheDocument();
    expect(
      screen.getByText("Primer párrafo del comunicado."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Segundo párrafo con más detalles."),
    ).toBeInTheDocument();
  });

  it("shows a not-found state when the news does not exist", async () => {
    renderDetail("99", makeActor(null));

    await waitFor(() => {
      expect(
        screen.getByTestId("news_detail.not_found_state"),
      ).toBeInTheDocument();
    });
  });
});

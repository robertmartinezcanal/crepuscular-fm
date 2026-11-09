import { setIdentityForTest } from "@/__tests__/setup";
import { renderWithActor } from "@/__tests__/test-utils";
import type { NewsItem, Result, backendInterface } from "@/backend";
import AdminNewsPage from "@/pages/AdminNewsPage";
import { Principal } from "@icp-sdk/core/principal";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const ALICE = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
const BOB = Principal.fromText("aaaaa-aa");

function makeItem(id: bigint, title: string, author: Principal): NewsItem {
  return {
    id,
    title,
    body: `Cuerpo de ${title}.`,
    publishedAt: 1_700_000_000_000_000_000n,
    author,
  };
}

/** A signed-in identity whose principal is `principal`. */
function signInAs(principal: Principal) {
  setIdentityForTest({
    identity: {
      getPrincipal: () => principal,
    } as never,
  });
}

function makeActor(
  items: NewsItem[],
  overrides: Partial<backendInterface> = {},
): Pick<
  backendInterface,
  "listNews" | "createNews" | "updateNews" | "deleteNews"
> {
  return {
    // Fresh objects per call, as a real remote actor returns; `structuredClone`
    // would strip the Principal prototype, so rebuild each item instead.
    listNews: vi.fn(async () =>
      items.map((item) => ({ ...item, author: Principal.from(item.author) })),
    ),
    createNews: vi.fn(async (title: string, _body: string) =>
      makeItem(99n, title, ALICE),
    ),
    updateNews: vi.fn(async () => ({
      __kind__: "ok",
      ok: makeItem(1n, "x", ALICE),
    })),
    deleteNews: vi.fn(async () => ({ __kind__: "ok", ok: null })),
    ...overrides,
  } as Pick<
    backendInterface,
    "listNews" | "createNews" | "updateNews" | "deleteNews"
  >;
}

describe("AdminNewsPage", () => {
  it("prompts an unauthenticated visitor to sign in", () => {
    setIdentityForTest();
    renderWithActor(<AdminNewsPage />, makeActor([]));

    expect(screen.getByTestId("admin_news.signin_prompt")).toBeInTheDocument();
    expect(screen.queryByTestId("admin_news.composer")).not.toBeInTheDocument();
  });

  it("shows only the signed-in user's own news", async () => {
    signInAs(ALICE);
    const mine = makeItem(1n, "Mi comunicado", ALICE);
    const theirs = makeItem(2n, "Comunicado ajeno", BOB);
    renderWithActor(<AdminNewsPage />, makeActor([mine, theirs]));

    await waitFor(() => {
      expect(screen.getByTestId("admin_news.list")).toBeInTheDocument();
    });
    expect(screen.getByText("Mi comunicado")).toBeInTheDocument();
    expect(screen.queryByText("Comunicado ajeno")).not.toBeInTheDocument();
  });

  it("lets signed-in staff publish a news item", async () => {
    signInAs(ALICE);
    const user = userEvent.setup();
    const actor = makeActor([]);
    renderWithActor(<AdminNewsPage />, actor);

    await waitFor(() => {
      expect(screen.getByTestId("admin_news.composer")).toBeInTheDocument();
    });

    await user.type(
      screen.getByTestId("admin_news.title_input"),
      "Nuevo comunicado",
    );
    await user.type(
      screen.getByTestId("admin_news.body_input"),
      "Contenido del comunicado.",
    );
    await user.click(screen.getByTestId("admin_news.submit_button"));

    await waitFor(() => {
      expect(actor.createNews).toHaveBeenCalledWith(
        "Nuevo comunicado",
        "Contenido del comunicado.",
      );
    });
  });

  it("surfaces a not-author error when editing another user's news", async () => {
    signInAs(ALICE);
    const user = userEvent.setup();
    const actor = makeActor([makeItem(1n, "Mi comunicado", ALICE)], {
      updateNews: vi.fn(
        async (): Promise<Result> => ({
          __kind__: "err",
          err: { __kind__: "notAuthor", notAuthor: 1n },
        }),
      ),
    });
    renderWithActor(<AdminNewsPage />, actor);

    await waitFor(() => {
      expect(
        screen.getByTestId("admin_news.edit_button.1"),
      ).toBeInTheDocument();
    });
    await user.click(screen.getByTestId("admin_news.edit_button.1"));
    await user.click(screen.getByTestId("admin_news.save_button"));

    await waitFor(() => {
      expect(actor.updateNews).toHaveBeenCalled();
    });
  });
});

import { PocketIc } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { createIdentity } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

const alice = createIdentity("alice");
const bob = createIdentity("bob");

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
  }));
});

afterAll(async () => {
  await pic?.tearDown();
});

it("answers empty-state reads instead of trapping", async () => {
  await expect(actor.listNews()).resolves.toEqual([]);
  await expect(actor.listSchedule()).resolves.toEqual([]);
  await expect(actor.getNews(0n)).resolves.toEqual([]);
});

it("round-trips a news item through the real canister", async () => {
  actor.setIdentity(alice);
  await actor._initialize_access_control();

  const created = await actor.createNews("Titular", "Cuerpo del comunicado");
  expect(created.title).toBe("Titular");
  expect(created.author.toText()).toBe(alice.getPrincipal().toText());

  const listed = await actor.listNews();
  expect(listed).toHaveLength(1);
  expect(listed[0]).toMatchObject({ title: "Titular" });

  const fetched = await actor.getNews(created.id);
  expect(fetched).toHaveLength(1);
  expect(fetched[0]).toMatchObject({ title: "Titular" });
});

it("rejects an anonymous caller from publishing news", async () => {
  const guest = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  await expect(guest.createNews("No permitido", "x")).rejects.toThrow();
});

it("does not let one author edit or delete another author's news", async () => {
  actor.setIdentity(alice);
  const created = await actor.createNews("De Alice", "Contenido");

  actor.setIdentity(bob);
  await actor._initialize_access_control();
  const update = await actor.updateNews(created.id, "Secuestrada", "x");
  expect(update).toEqual({ err: { notAuthor: created.id } });
  const remove = await actor.deleteNews(created.id);
  expect(remove).toEqual({ err: { notAuthor: created.id } });

  // Alice's item is untouched.
  actor.setIdentity(alice);
  const listed = await actor.listNews();
  expect(listed.some((item) => item.title === "De Alice")).toBe(true);
});

it("lets the author update and delete their own news", async () => {
  actor.setIdentity(alice);
  const created = await actor.createNews("Original", "Contenido");

  const updated = await actor.updateNews(created.id, "Actualizada", "Nuevo");
  expect("ok" in updated).toBe(true);

  const removed = await actor.deleteNews(created.id);
  expect(removed).toEqual({ ok: null });
  await expect(actor.getNews(created.id)).resolves.toEqual([]);
});

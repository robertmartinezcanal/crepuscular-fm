import { renderWithActor } from "@/__tests__/test-utils";
import { LivePlayer } from "@/components/LivePlayer";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * A controllable stand-in for HTMLAudioElement. jsdom does not implement
 * playback, so the hook's real event wiring is exercised by dispatching the
 * same events a browser would.
 */
class FakeAudio {
  static instances: FakeAudio[] = [];
  src: string;
  preload = "";
  crossOrigin: string | null = null;
  volume = 1;
  muted = false;
  playResult: "resolve" | "reject" = "resolve";
  private listeners = new Map<string, Set<() => void>>();

  constructor(src: string) {
    this.src = src;
    FakeAudio.instances.push(this);
  }

  addEventListener(type: string, handler: () => void) {
    const set = this.listeners.get(type) ?? new Set();
    set.add(handler);
    this.listeners.set(type, set);
  }

  removeEventListener(type: string, handler: () => void) {
    this.listeners.get(type)?.delete(handler);
  }

  emit(type: string) {
    for (const handler of this.listeners.get(type) ?? []) handler();
  }

  play(): Promise<void> {
    if (this.playResult === "reject") {
      return Promise.reject(new Error("blocked"));
    }
    return Promise.resolve();
  }

  pause() {
    this.emit("pause");
  }

  load() {}
}

class FakeResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("LivePlayer", () => {
  beforeEach(() => {
    FakeAudio.instances = [];
    vi.stubGlobal("Audio", FakeAudio);
    vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts the live signal and shows the playing state", async () => {
    const user = userEvent.setup();
    renderWithActor(<LivePlayer />, {});

    const playButton = screen.getByRole("button", {
      name: "Reproducir la señal en vivo",
    });
    await user.click(playButton);

    const audio = FakeAudio.instances[0];
    expect(audio.src).toContain("stream.zeno.fm");
    audio.emit("playing");

    await waitFor(() => {
      expect(screen.getByTestId("player.status.live")).toHaveTextContent(
        "En vivo",
      );
    });
    expect(
      screen.getByRole("button", { name: "Pausar la señal en vivo" }),
    ).toBeInTheDocument();
  });

  it("shows a clear error with a retry action when the signal fails", async () => {
    const user = userEvent.setup();
    renderWithActor(<LivePlayer />, {});

    await user.click(
      screen.getByRole("button", { name: "Reproducir la señal en vivo" }),
    );
    const audio = FakeAudio.instances[0];
    audio.emit("error");

    await waitFor(() => {
      expect(screen.getByTestId("player.status.offline")).toHaveTextContent(
        "Sin señal",
      );
    });
    expect(screen.getByTestId("player.error_state")).toHaveTextContent(
      "No pudimos conectar con la señal en vivo",
    );

    // Retry re-attempts playback and recovers to the live state.
    audio.playResult = "resolve";
    await user.click(screen.getByTestId("player.retry_button"));
    audio.emit("playing");

    await waitFor(() => {
      expect(screen.getByTestId("player.status.live")).toBeInTheDocument();
    });
  });

  it("reports a blocked autoplay attempt as an offline error", async () => {
    const user = userEvent.setup();
    renderWithActor(<LivePlayer />, {});

    await user.click(
      screen.getByRole("button", { name: "Reproducir la señal en vivo" }),
    );
    const audio = FakeAudio.instances[0];
    audio.playResult = "reject";
    audio.emit("error");

    await waitFor(() => {
      expect(screen.getByTestId("player.error_state")).toBeInTheDocument();
    });
  });
});

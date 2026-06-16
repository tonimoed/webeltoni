import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  duck,
  unduck,
  pause,
  resume,
  isDucked,
  isPausedExternally,
  onDuck,
  onPause,
  __resetAudioBus,
} from "@/lib/audio-bus";

describe("audio-bus", () => {
  beforeEach(() => __resetAudioBus());

  it("ducks and unducks, notifying listeners once per transition", () => {
    const spy = vi.fn();
    onDuck(spy);

    expect(isDucked()).toBe(false);
    duck();
    expect(isDucked()).toBe(true);
    duck(); // idempotent
    unduck();
    expect(isDucked()).toBe(false);

    expect(spy).toHaveBeenCalledTimes(2); // duck(true), unduck(false)
    expect(spy).toHaveBeenNthCalledWith(1, true);
    expect(spy).toHaveBeenNthCalledWith(2, false);
  });

  it("pauses and resumes external exclusive playback", () => {
    const spy = vi.fn();
    onPause(spy);

    pause();
    expect(isPausedExternally()).toBe(true);
    resume();
    expect(isPausedExternally()).toBe(false);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("unsubscribes listeners", () => {
    const spy = vi.fn();
    const off = onDuck(spy);
    off();
    duck();
    expect(spy).not.toHaveBeenCalled();
  });
});

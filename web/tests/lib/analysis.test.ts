import { mkdir, readFile, writeFile } from "fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  deleteDailyAnalysis,
  toggleDailyAnalysisPublished,
  type DailyAnalysis,
} from "@/lib/analysis";
import { deleteAnalysisImage } from "@/lib/r2";

vi.mock("fs/promises", () => {
  const fileSystem = {
    mkdir: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn(),
  };
  return { ...fileSystem, default: fileSystem };
});

vi.mock("@/lib/r2", () => ({ deleteAnalysisImage: vi.fn() }));

const analysis: DailyAnalysis = {
  id: "analysis-1",
  title: "Gold session setup",
  symbol: "XAUUSD",
  timeframe: "M15",
  bias: "BULLISH",
  imageUrl: "https://storage.example.com/chart.png",
  imageKey: "gcs:analysis/chart.png",
  description: "Gold session analysis",
  session: "London",
  author: "Kiaros",
  published: false,
  createdAt: "2026-10-14T00:00:00Z",
  updatedAt: "2026-10-14T00:00:00Z",
};
const otherAnalysis = { ...analysis, id: "analysis-2", imageKey: undefined };

function remoteAnalysesResponse() {
  return new Response(JSON.stringify([{ ...analysis, image_key: analysis.imageKey }]), {
    status: 200,
  });
}

function savedLocalAnalyses(): DailyAnalysis[] {
  expect(writeFile).toHaveBeenCalledTimes(1);
  return JSON.parse(String(vi.mocked(writeFile).mock.calls[0][1]));
}

describe("daily analysis persistence", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://supabase.example.com");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.mocked(readFile).mockResolvedValue(JSON.stringify([analysis, otherAnalysis]));
    vi.mocked(mkdir).mockResolvedValue(undefined);
    vi.mocked(writeFile).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("publishes remotely without touching a read-only filesystem", async () => {
    const readOnly = Object.assign(new Error("Read-only filesystem"), { code: "EROFS" });
    vi.mocked(readFile).mockRejectedValue(readOnly);
    vi.mocked(mkdir).mockRejectedValue(readOnly);
    vi.mocked(writeFile).mockRejectedValue(readOnly);
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(toggleDailyAnalysisPublished(analysis.id, true)).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(`id=eq.${analysis.id}`),
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(readFile).not.toHaveBeenCalled();
    expect(mkdir).not.toHaveBeenCalled();
    expect(writeFile).not.toHaveBeenCalled();
  });

  it("deletes remotely without touching a read-only filesystem", async () => {
    const readOnly = Object.assign(new Error("Read-only filesystem"), { code: "EROFS" });
    vi.mocked(readFile).mockRejectedValue(readOnly);
    vi.mocked(mkdir).mockRejectedValue(readOnly);
    vi.mocked(writeFile).mockRejectedValue(readOnly);
    fetchMock
      .mockResolvedValueOnce(remoteAnalysesResponse())
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    await expect(deleteDailyAnalysis(analysis.id)).resolves.toBe(true);

    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining(`id=eq.${analysis.id}`),
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(deleteAnalysisImage).toHaveBeenCalledWith(analysis.imageKey);
    expect(readFile).not.toHaveBeenCalled();
    expect(mkdir).not.toHaveBeenCalled();
    expect(writeFile).not.toHaveBeenCalled();
  });

  it("preserves local-only publishing when Supabase is absent", async () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    await expect(toggleDailyAnalysisPublished(analysis.id, true)).resolves.toBe(true);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(savedLocalAnalyses()).toEqual([
      { ...analysis, published: true },
      otherAnalysis,
    ]);
  });

  it("preserves local-only deletion when Supabase is absent", async () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    await expect(deleteDailyAnalysis(analysis.id)).resolves.toBe(true);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(deleteAnalysisImage).toHaveBeenCalledWith(analysis.imageKey);
    expect(savedLocalAnalyses()).toEqual([otherAnalysis]);
  });

  it("falls back to local publishing when Supabase rejects the update", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(toggleDailyAnalysisPublished(analysis.id, true)).resolves.toBe(true);

    expect(savedLocalAnalyses()[0].published).toBe(true);
  });

  it("falls back to local deletion when Supabase rejects the deletion", async () => {
    fetchMock
      .mockResolvedValueOnce(remoteAnalysesResponse())
      .mockResolvedValueOnce(new Response(null, { status: 500 }));

    await expect(deleteDailyAnalysis(analysis.id)).resolves.toBe(true);

    expect(savedLocalAnalyses()).toEqual([otherAnalysis]);
  });
});

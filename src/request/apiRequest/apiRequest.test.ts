import { describe, it, expect, vi, afterEach, beforeEach, type MockInstance } from "vitest";
import { ApiRequest } from "./apiRequest";
import { TokenAuthStrategy } from "../auth/tokenAuthStrategy";

describe("ApiRequest", () => {

  let apiRequest: ApiRequest;

  let fetchSpy: MockInstance<typeof fetch>;


  const mockResponse = {
    ok: true,
    json: async () => ({ id: 1, name: "Test" })
  };

  beforeEach(() => {
    fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(mockResponse as Response);
    vi.useFakeTimers();
    apiRequest = new ApiRequest(fetch, new TokenAuthStrategy(() => "token"));
  });

  afterEach(() => {
    vi.useRealTimers();
    fetchSpy.mockRestore();
  });

  it("should call fetch", async () => {
    await apiRequest.call("http://test.com");
    const calledWith = fetchSpy.mock.calls[0];
    expect(calledWith[0]).toBe("http://test.com");
  });

  it("should call fetch with token auth strategy", async () => {
    await apiRequest.call("http://test.com");
    const calledWith = fetchSpy.mock.calls[0];
    const auth = (calledWith[1]?.headers as Headers).get("Authorization");
    expect(auth).toBe("Bearer token");
  });
});
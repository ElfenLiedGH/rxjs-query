import { afterEach, beforeEach, describe, expect, type MockInstance, vi, it } from "vitest";
import { RxJsRequest } from "./rxJsRequest";
import { CacheController } from "../cacheController";
import { deepObjectCompare } from "../utils";
import { ApiRequest } from "../apiRequest";
import { TokenAuthStrategy } from "../auth/tokenAuthStrategy";

describe("RxJsRequest", () => {

  let fetchSpy: MockInstance<typeof fetch>;

  let rxJsRequest: RxJsRequest;

  beforeEach(() => {

    vi.useFakeTimers();

    const mockResponse = {
      ok: true,
      json: async () => ({ id: 1, name: "Test" })
    };

    fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(mockResponse as Response);
    vi.useFakeTimers();
    const apiRequest = new ApiRequest(fetch, new TokenAuthStrategy(() => "token"));

    const cacheController = new CacheController(
      true,
      deepObjectCompare,
      100);

    rxJsRequest = new RxJsRequest(apiRequest, cacheController, "https://test.com");
  });

  afterEach(() => {
    vi.useRealTimers();
    fetchSpy.mockRestore();
  });

  it("should fetch base url +  query", async () => {
    const mockCallback = vi.fn();
    const { subject } = rxJsRequest.createApiRequest("test");
    subject.subscribe(mockCallback);
    await vi.waitFor(() => {
      const calledWith = fetchSpy.mock.calls[0];
      expect(calledWith[0]).toBe("https://test.com/test");
    });
  });
  it("should emit 2 events", async () => {
    const mockCallback = vi.fn();
    const { subject } = rxJsRequest.createApiRequest("test");
    subject.subscribe(mockCallback);
    await vi.waitFor(() => {
      expect(mockCallback).toHaveBeenCalledTimes(2);
    });
  });


  it("should emit loading true and loading false with data", async () => {
    const mockCallback = vi.fn();
    const { subject } = rxJsRequest.createApiRequest("test");
    subject.subscribe(mockCallback);
    expect(mockCallback).toHaveBeenCalledWith({
      called: true,
      completed: false,
      data: undefined,
      error: undefined,
      loading: true
    });
    await vi.waitFor(() => {
      expect(mockCallback).toHaveBeenCalledWith({
        called: true,
        completed: true,
        data: {
          id: 1,
          name: "Test"
        },
        error: undefined,
        loading: false
      });
    });
  });

  it("should fetching only 1 on parallel request", async () => {
    rxJsRequest.createApiRequest("test");
    rxJsRequest.createApiRequest("test");
    await vi.waitFor(() => {
      expect(fetchSpy.mock.calls.length).toBe(1);
    });
  });

  it("should return the same data on parallel request", async () => {
    const { subject: subject1 } = rxJsRequest.createApiRequest("test");
    const mockCallback1 = vi.fn();
    subject1.subscribe(mockCallback1);
    const { subject: subject2 } = rxJsRequest.createApiRequest("test");
    const mockCallback2 = vi.fn();
    subject2.subscribe(mockCallback2);
    expect(mockCallback1).toHaveBeenCalled();
    expect(mockCallback2).toHaveBeenCalled();
    const call1Args1 = mockCallback1.mock.calls[0];
    const call2Args1 = mockCallback2.mock.calls[0];
    expect(call1Args1[0]).toBe(call2Args1[0]);

    await vi.waitFor(() => {
      const call1Args2 = mockCallback1.mock.calls[1];
      const call2Args2 = mockCallback2.mock.calls[1];
      expect(call2Args2[0]).toBe(call1Args2[0]);
    });
  });

});
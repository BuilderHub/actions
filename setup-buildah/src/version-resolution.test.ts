/***************************************************************************************************
 *  Copyright (c) BuilderHub. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 **************************************************************************************************/

import {
    describe,
    expect,
    it,
    vi,
} from "vitest";

import { resolveBuildahReleaseTag } from "./version-resolution";

function jsonResponse(body: unknown, status: number = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        statusText: status === 200 ? "OK" : "Not Found",
    });
}

describe("resolveBuildahReleaseTag", () => {
    it("returns tag_name for latest", async () => {
        const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ tag_name: "v2.0.0" }));
        await expect(resolveBuildahReleaseTag("latest", fetchMock)).resolves.toBe("v2.0.0");
        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining("/releases/latest"),
            expect.any(Object),
        );
    });

    it("throws when latest release cannot be resolved", async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response("", { status: 503 }));
        await expect(resolveBuildahReleaseTag("latest", fetchMock)).rejects.toThrow(/HTTP 503/);
    });

    it("normalizes a version without v prefix", async () => {
        const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
        await expect(resolveBuildahReleaseTag("1.40.0", fetchMock)).resolves.toBe("v1.40.0");
        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringMatching(/releases\/tags\/v1\.40\.0$/),
            expect.any(Object),
        );
    });

    it("preserves a version that already has a v prefix", async () => {
        const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
        await expect(resolveBuildahReleaseTag("v1.40.0", fetchMock)).resolves.toBe("v1.40.0");
    });

    it("throws when a specific tag has no release", async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response("", { status: 404 }));
        await expect(resolveBuildahReleaseTag("v0.0.0-not-real", fetchMock)).rejects.toThrow(/No containers\/buildah/);
    });

    it("rejects whitespace-only input", async () => {
        const fetchMock = vi.fn();
        await expect(resolveBuildahReleaseTag("   ", fetchMock)).rejects.toThrow(/must not be empty/);
        expect(fetchMock).not.toHaveBeenCalled();
    });
});

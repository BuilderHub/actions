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

import { GO_DOWNLOAD_FALLBACK_VERSION } from "./constants";
import {
    parseGoDirectiveFromModFile,
    resolveGoToolchainVersionForBuildahTag,
} from "./go-toolchain-version";

describe("parseGoDirectiveFromModFile", () => {
    it("extracts the go directive", () => {
        const mod = "module github.com/containers/buildah\n\ngo 1.24.2\n";
        expect(parseGoDirectiveFromModFile(mod)).toBe("1.24.2");
    });

    it("returns undefined when the directive is missing", () => {
        expect(parseGoDirectiveFromModFile("module x\n")).toBeUndefined();
    });
});

describe("resolveGoToolchainVersionForBuildahTag", () => {
    it("returns parsed version from go.mod", async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response("module x\n\ngo 1.22.1\n", { status: 200 }),
        );
        const warn = vi.fn();
        await expect(
            resolveGoToolchainVersionForBuildahTag("v1.0.0", fetchMock, warn),
        ).resolves.toBe("1.22.1");
        expect(warn).toHaveBeenCalledTimes(0);
    });

    it("falls back when go.mod cannot be fetched", async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response("", { status: 404 }));
        const warn = vi.fn();
        await expect(
            resolveGoToolchainVersionForBuildahTag("v1.0.0", fetchMock, warn),
        ).resolves.toBe(GO_DOWNLOAD_FALLBACK_VERSION);
        expect(warn).toHaveBeenCalledTimes(1);
    });

    it("falls back when go directive is missing", async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response("module x\n", { status: 200 }));
        const warn = vi.fn();
        await expect(
            resolveGoToolchainVersionForBuildahTag("v1.0.0", fetchMock, warn),
        ).resolves.toBe(GO_DOWNLOAD_FALLBACK_VERSION);
        expect(warn).toHaveBeenCalledTimes(1);
    });
});

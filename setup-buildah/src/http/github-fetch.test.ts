/***************************************************************************************************
 *  Copyright (c) BuilderHub. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 **************************************************************************************************/

import {
    afterEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import { createGitHubFetchHeaders, githubApiGet } from "./github-fetch";

describe("createGitHubFetchHeaders", () => {
    const originalToken = process.env.GITHUB_TOKEN;

    afterEach(() => {
        if (originalToken === undefined) {
            delete process.env.GITHUB_TOKEN;
        }
        else {
            process.env.GITHUB_TOKEN = originalToken;
        }
    });

    it("adds Authorization when GITHUB_TOKEN is set", () => {
        process.env.GITHUB_TOKEN = "test-token";
        const headers = createGitHubFetchHeaders();
        expect(headers.Authorization).toBe("Bearer test-token");
        expect(headers.Accept).toContain("github");
        expect(headers["User-Agent"]).toBe("BuilderHub/setup-buildah");
    });

    it("omits Authorization when GITHUB_TOKEN is unset", () => {
        delete process.env.GITHUB_TOKEN;
        const headers = createGitHubFetchHeaders();
        expect(headers.Authorization).toBeUndefined();
    });
});

describe("githubApiGet", () => {
    it("forwards the URL and attaches GitHub headers", async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
        await githubApiGet("https://api.github.com/repos/containers/buildah/releases/latest", fetchMock);
        expect(fetchMock).toHaveBeenCalledWith(
            "https://api.github.com/repos/containers/buildah/releases/latest",
            expect.objectContaining({
                headers: expect.objectContaining({
                    Accept: "application/vnd.github+json",
                }),
            }),
        );
    });
});

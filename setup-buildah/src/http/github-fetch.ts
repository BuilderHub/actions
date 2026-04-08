/***************************************************************************************************
 *  Copyright (c) BuilderHub. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 **************************************************************************************************/

import {
    ACTION_USER_AGENT,
    GITHUB_API_VERSION_HEADER,
} from "../constants";

export type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

/**
 * Minimal GitHub REST client headers (optional bearer token for rate limits).
 */
export function createGitHubFetchHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": GITHUB_API_VERSION_HEADER,
        "User-Agent": ACTION_USER_AGENT,
    };
    const token = process.env.GITHUB_TOKEN;
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return headers;
}

export async function githubApiGet(url: string, fetchImpl: FetchLike = globalThis.fetch): Promise<Response> {
    return fetchImpl(url, { headers: createGitHubFetchHeaders() });
}

/***************************************************************************************************
 *  Copyright (c) BuilderHub. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 **************************************************************************************************/

import {
    ActionInputs,
    DEFAULT_BUILDAH_VERSION_INPUT,
    GITHUB_API_BASE,
} from "./constants";
import type { FetchLike } from "./http/github-fetch";
import { githubApiGet } from "./http/github-fetch";

interface GitHubReleaseJson {
    tag_name: string;
}

function normalizeVersionInput(raw: string): string {
    const trimmed = raw.trim();
    if (!trimmed) {
        throw new Error(
            `Input "${ActionInputs.buildahVersion}" must not be empty (default is "${DEFAULT_BUILDAH_VERSION_INPUT}").`,
        );
    }
    return trimmed;
}

function releaseTagUrl(tag: string): string {
    return `${GITHUB_API_BASE}/releases/tags/${encodeURIComponent(tag)}`;
}

/**
 * Resolves workflow input to a concrete `containers/buildah` release tag (e.g. `v1.43.0`).
 */
export async function resolveBuildahReleaseTag(
    versionInput: string,
    fetchImpl: FetchLike = globalThis.fetch,
): Promise<string> {
    const input = normalizeVersionInput(versionInput);

    if (input.toLowerCase() === DEFAULT_BUILDAH_VERSION_INPUT) {
        const res = await githubApiGet(`${GITHUB_API_BASE}/releases/latest`, fetchImpl);
        if (!res.ok) {
            throw new Error(`Could not resolve latest buildah release (HTTP ${res.status}).`);
        }
        const body = await res.json() as GitHubReleaseJson;
        return body.tag_name;
    }

    const tag = input.startsWith("v") ? input : `v${input}`;
    const res = await githubApiGet(releaseTagUrl(tag), fetchImpl);
    if (!res.ok) {
        throw new Error(
            `No containers/buildah GitHub release for tag ${tag} (HTTP ${res.status}). `
            + `Use a published tag (e.g. v1.43.0) or "${DEFAULT_BUILDAH_VERSION_INPUT}".`,
        );
    }
    return tag;
}

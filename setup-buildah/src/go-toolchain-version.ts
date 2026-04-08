/***************************************************************************************************
 *  Copyright (c) BuilderHub. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 **************************************************************************************************/

import {
    BUILDAH_GITHUB_REPO,
    GO_DOWNLOAD_FALLBACK_VERSION,
    GITHUB_RAW_BASE,
} from "./constants";
import type { FetchLike } from "./http/github-fetch";

export type LogWarning = (message: string) => void;

/**
 * Parses the `go X.Y.Z` directive from a go.mod file body.
 */
export function parseGoDirectiveFromModFile(contents: string): string | undefined {
    const match = contents.match(/^go ([\d.]+)/m);
    return match?.[1];
}

function goModUrlForTag(tag: string): string {
    return `${GITHUB_RAW_BASE}/${encodeURIComponent(tag)}/go.mod`;
}

/**
 * Reads `go.mod` at the release tag to pick the Go toolchain version for official `go.dev/dl` archives.
 */
export async function resolveGoToolchainVersionForBuildahTag(
    tag: string,
    fetchImpl: FetchLike = globalThis.fetch,
    warn: LogWarning = () => undefined,
): Promise<string> {
    const res = await fetchImpl(goModUrlForTag(tag));
    if (!res.ok) {
        warn(`Could not fetch go.mod for ${tag} (HTTP ${res.status}); using Go ${GO_DOWNLOAD_FALLBACK_VERSION}`);
        return GO_DOWNLOAD_FALLBACK_VERSION;
    }
    const text = await res.text();
    const version = parseGoDirectiveFromModFile(text);
    if (!version) {
        warn(
            `Could not parse Go version from ${BUILDAH_GITHUB_REPO} go.mod at ${tag}; `
            + `using Go ${GO_DOWNLOAD_FALLBACK_VERSION}`,
        );
        return GO_DOWNLOAD_FALLBACK_VERSION;
    }
    return version;
}

/***************************************************************************************************
 *  Copyright (c) BuilderHub. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 **************************************************************************************************/

/** Go toolchain archive suffix for `go.dev/dl`. */
export type GoLinuxArch = "amd64" | "arm64";

/**
 * Maps `process.arch` on supported GitHub-hosted runners to Go's `GOARCH` for official tarballs.
 */
export function nodeArchToGoLinuxArch(nodeArch: NodeJS.Architecture): GoLinuxArch {
    switch (nodeArch) {
    case "x64":
        return "amd64";
    case "arm64":
        return "arm64";
    default:
        throw new Error(
            `Unsupported runner architecture "${nodeArch}". setup-buildah supports x64 and arm64 only.`,
        );
    }
}

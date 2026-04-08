/***************************************************************************************************
 *  Copyright (c) BuilderHub. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 **************************************************************************************************/

/** Names aligned with `action.yml` inputs and outputs. */
export const ActionInputs = {
    buildahVersion: "buildah-version",
} as const;

export const ActionOutputs = {
    buildahPath: "buildah-path",
} as const;

/** Default for `buildah-version` when the workflow omits the input. */
export const DEFAULT_BUILDAH_VERSION_INPUT = "latest";

export const BUILDAH_GITHUB_REPO = "containers/buildah" as const;

export const GITHUB_API_BASE = `https://api.github.com/repos/${BUILDAH_GITHUB_REPO}` as const;

export const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/${BUILDAH_GITHUB_REPO}` as const;

export const BUILDAH_INSTALL_PATH = "/usr/local/bin/buildah" as const;

export const GO_DOWNLOAD_FALLBACK_VERSION = "1.24.2" as const;

export const GITHUB_API_VERSION_HEADER = "2022-11-28" as const;

export const ACTION_USER_AGENT = "BuilderHub/setup-buildah" as const;

export const TEMP_DIR_PREFIX = "setup-buildah-" as const;

export const GOTOOLCHAIN_LOCAL = "local" as const;

/** Packages required to compile Buildah from source on Debian/Ubuntu runners. */
export const APT_BUILD_DEPENDENCIES = [
    "ca-certificates",
    "curl",
    "git",
    "make",
    "gcc",
    "pkg-config",
    "libgpgme-dev",
    "libseccomp-dev",
    "libbtrfs-dev",
    "libdevmapper-dev",
    "libapparmor-dev",
    "libglib2.0-dev",
    "libsqlite3-dev",
] as const;

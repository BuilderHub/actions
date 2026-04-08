/***************************************************************************************************
 *  Copyright (c) BuilderHub. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 **************************************************************************************************/

import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

import { nodeArchToGoLinuxArch } from "./arch";
import {
    APT_BUILD_DEPENDENCIES,
    BUILDAH_INSTALL_PATH,
    GOTOOLCHAIN_LOCAL,
    TEMP_DIR_PREFIX,
} from "./constants";
import { resolveGoToolchainVersionForBuildahTag } from "./go-toolchain-version";
import type { FetchLike } from "./http/github-fetch";
import { resolveBuildahReleaseTag } from "./version-resolution";

export type ExecFn = (
    commandLine: string,
    args?: string[],
    options?: exec.ExecOptions,
) => Promise<number>;

export interface InstallBuildahDependencies {
    readonly execImpl?: ExecFn;
    readonly mkdtemp?: typeof fs.mkdtemp;
    readonly tmpdir?: typeof os.tmpdir;
    readonly arch?: NodeJS.Architecture;
    readonly githubFetch?: FetchLike;
}

function buildPathWithGoPrefix(goRootBin: string, pathEnv: string | undefined): string {
    return `${goRootBin}${path.delimiter}${pathEnv ?? ""}`;
}

function envForExec(overrides: Record<string, string>): Record<string, string> {
    const base: Record<string, string> = {};
    for (const [ key, value ] of Object.entries(process.env)) {
        if (value !== undefined) {
            base[key] = value;
        }
    }
    return { ...base, ...overrides };
}

/**
 * Clones `containers/buildah` at the resolved tag, builds `bin/buildah`, and installs to `/usr/local/bin/buildah`.
 */
export async function installBuildahFromSource(
    versionInput: string,
    deps: InstallBuildahDependencies = {},
): Promise<string> {
    const execImpl = deps.execImpl ?? exec.exec;
    const mkdtemp = deps.mkdtemp ?? fs.mkdtemp;
    const tmpdir = deps.tmpdir ?? os.tmpdir;
    const arch = deps.arch ?? process.arch;
    const githubFetch = deps.githubFetch ?? globalThis.fetch;

    const tag = await resolveBuildahReleaseTag(versionInput, githubFetch);
    const goVer = await resolveGoToolchainVersionForBuildahTag(
        tag,
        githubFetch,
        (message) => core.warning(message),
    );
    const goArch = nodeArchToGoLinuxArch(arch);

    core.info(`Installing Buildah ${tag} from source (Go ${goVer}, linux-${goArch})`);

    core.startGroup("Install build dependencies (apt)");
    await execImpl("sudo", [ "apt-get", "update", "-qq" ]);
    await execImpl("sudo", [
        "apt-get",
        "install",
        "-y",
        "--no-install-recommends",
        ...APT_BUILD_DEPENDENCIES,
    ]);
    core.endGroup();

    const goTar = `go${goVer}.linux-${goArch}.tar.gz`;
    const goUrl = `https://go.dev/dl/${goTar}`;
    const workRoot = await mkdtemp(path.join(tmpdir(), TEMP_DIR_PREFIX));
    const goArchivePath = path.join(workRoot, goTar);

    core.startGroup(`Download Go ${goVer}`);
    await execImpl("curl", [ "-fsSL", goUrl, "-o", goArchivePath ]);
    core.endGroup();

    await execImpl("tar", [ "-xzf", goArchivePath, "-C", workRoot ]);
    const extractedGoRoot = path.join(workRoot, "go");

    const buildEnv = envForExec({
        PATH: buildPathWithGoPrefix(path.join(extractedGoRoot, "bin"), process.env.PATH),
        GOTOOLCHAIN: GOTOOLCHAIN_LOCAL,
    });

    const srcDir = path.join(workRoot, "buildah");
    core.startGroup(`Build Buildah ${tag}`);
    await execImpl("git", [
        "clone",
        "--depth", "1",
        "--branch", tag,
        "https://github.com/containers/buildah.git",
        srcDir,
    ], { env: buildEnv });
    await execImpl("make", [ "bin/buildah" ], { cwd: srcDir, env: buildEnv });
    core.endGroup();

    core.startGroup("Install buildah to /usr/local/bin");
    await execImpl("sudo", [
        "install",
        "-m", "755",
        path.join(srcDir, "bin", "buildah"),
        BUILDAH_INSTALL_PATH,
    ]);
    core.endGroup();

    return BUILDAH_INSTALL_PATH;
}

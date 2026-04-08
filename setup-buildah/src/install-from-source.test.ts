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

import { APT_BUILD_DEPENDENCIES, BUILDAH_INSTALL_PATH } from "./constants";
import { type ExecFn, installBuildahFromSource } from "./install-from-source";

describe("installBuildahFromSource", () => {
    it("invokes apt, toolchain download, clone, make, and install using injected dependencies", async () => {
        const invocations: { command: string; args: string[] }[] = [];
        const execImpl: ExecFn = async (commandLine, args = []) => {
            invocations.push({ command: commandLine, args: [ ...args ] });
            return 0;
        };

        const fetchImpl = vi.fn()
            .mockResolvedValueOnce(new Response("{}", { status: 200 }))
            .mockResolvedValueOnce(new Response("module x\n\ngo 1.22.0\n", { status: 200 }));

        const result = await installBuildahFromSource("v1.0.0", {
            execImpl,
            githubFetch: fetchImpl,
            arch: "x64",
            tmpdir: () => "/tmp",
            mkdtemp: async (prefix) => `${prefix}mockwork`,
        });

        expect(result).toBe(BUILDAH_INSTALL_PATH);
        expect(fetchImpl).toHaveBeenCalledTimes(2);

        const aptInstall = invocations.find(
            (i) => i.command === "sudo" && i.args[0] === "apt-get" && i.args[1] === "install",
        );
        expect(aptInstall).toBeDefined();
        for (const pkg of APT_BUILD_DEPENDENCIES) {
            expect(aptInstall?.args).toContain(pkg);
        }

        const curl = invocations.find((i) => i.command === "curl");
        expect(curl?.args.join(" ")).toMatch(/go1\.22\.0\.linux-amd64\.tar\.gz/);

        const gitClone = invocations.find((i) => i.command === "git" && i.args[0] === "clone");
        expect(gitClone?.args).toContain("--branch");
        expect(gitClone?.args).toContain("v1.0.0");

        const make = invocations.find((i) => i.command === "make");
        expect(make?.args).toEqual([ "bin/buildah" ]);

        const install = invocations.find((i) => i.command === "sudo" && i.args[0] === "install");
        expect(install?.args).toContain(BUILDAH_INSTALL_PATH);
    });
});

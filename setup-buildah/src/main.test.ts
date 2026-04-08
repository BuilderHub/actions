/***************************************************************************************************
 *  Copyright (c) BuilderHub. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 **************************************************************************************************/

import * as core from "@actions/core";
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

import { ActionInputs, ActionOutputs, BUILDAH_INSTALL_PATH } from "./constants";
import { installBuildahFromSource } from "./install-from-source";
import { run } from "./main";

vi.mock("@actions/core", () => ({
    getInput: vi.fn(),
    setOutput: vi.fn(),
    info: vi.fn(),
}));

vi.mock("./install-from-source", () => ({
    installBuildahFromSource: vi.fn().mockResolvedValue(BUILDAH_INSTALL_PATH),
}));

describe("run", () => {
    const originalRunnerOs = process.env.RUNNER_OS;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.RUNNER_OS = "Linux";
    });

    afterEach(() => {
        process.env.RUNNER_OS = originalRunnerOs;
    });

    it("reads input, installs Buildah, and exposes the binary path", async () => {
        vi.mocked(core.getInput).mockImplementation((name: string) => {
            if (name === ActionInputs.buildahVersion) {
                return "v1.40.0";
            }
            return "";
        });

        await run();

        expect(installBuildahFromSource).toHaveBeenCalledTimes(1);
        expect(installBuildahFromSource).toHaveBeenCalledWith("v1.40.0");
        expect(core.setOutput).toHaveBeenCalledWith(ActionOutputs.buildahPath, BUILDAH_INSTALL_PATH);
        expect(core.info).toHaveBeenCalled();
    });

    it("rejects non-Linux runners", async () => {
        process.env.RUNNER_OS = "Windows";
        await expect(run()).rejects.toThrow(/Linux/);
        expect(installBuildahFromSource).not.toHaveBeenCalled();
    });
});

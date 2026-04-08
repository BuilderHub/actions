/***************************************************************************************************
 *  Copyright (c) BuilderHub. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 **************************************************************************************************/

import * as core from "@actions/core";

import { ActionInputs, ActionOutputs } from "./constants";
import { installBuildahFromSource } from "./install-from-source";
import { assertLinuxRunner } from "./runner";

export async function run(): Promise<void> {
    assertLinuxRunner(process.env.RUNNER_OS);

    const version = core.getInput(ActionInputs.buildahVersion);
    const buildahPath = await installBuildahFromSource(version);
    core.setOutput(ActionOutputs.buildahPath, buildahPath);
    core.info(`Buildah is available at ${buildahPath}`);
}

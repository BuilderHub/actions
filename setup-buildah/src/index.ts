/***************************************************************************************************
 *  Copyright (c) BuilderHub. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 **************************************************************************************************/

import * as core from "@actions/core";

import { run } from "./main";

// GitHub Actions entrypoint: do not await; failures go through core.setFailed.
// eslint-disable-next-line no-void -- intentional fire-and-forget for the runner
void run().catch(core.setFailed);

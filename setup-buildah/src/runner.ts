/***************************************************************************************************
 *  Copyright (c) BuilderHub. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 **************************************************************************************************/

export function assertLinuxRunner(runnerOs: string | undefined): void {
    if (runnerOs !== "Linux") {
        throw new Error("setup-buildah only supports Linux runners.");
    }
}

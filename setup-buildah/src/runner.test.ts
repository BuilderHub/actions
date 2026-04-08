/***************************************************************************************************
 *  Copyright (c) BuilderHub. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 **************************************************************************************************/

import {
    describe,
    expect,
    it,
} from "vitest";

import { assertLinuxRunner } from "./runner";

describe("assertLinuxRunner", () => {
    it("does not throw when RUNNER_OS is Linux", () => {
        expect(() => assertLinuxRunner("Linux")).not.toThrow();
    });

    it("throws for non-Linux runners", () => {
        expect(() => assertLinuxRunner("Windows")).toThrow(/Linux/);
        expect(() => assertLinuxRunner("macOS")).toThrow(/Linux/);
    });

    it("throws when RUNNER_OS is undefined", () => {
        expect(() => assertLinuxRunner(undefined)).toThrow(/Linux/);
    });
});

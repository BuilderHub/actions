/***************************************************************************************************
 *  Copyright (c) BuilderHub. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 **************************************************************************************************/

import {
    describe,
    expect,
    it,
} from "vitest";

import { nodeArchToGoLinuxArch } from "./arch";

describe("nodeArchToGoLinuxArch", () => {
    it("maps x64 to amd64", () => {
        expect(nodeArchToGoLinuxArch("x64")).toBe("amd64");
    });

    it("maps arm64 to arm64", () => {
        expect(nodeArchToGoLinuxArch("arm64")).toBe("arm64");
    });

    it("throws for unsupported architectures", () => {
        expect(() => nodeArchToGoLinuxArch("ia32")).toThrow(/Unsupported runner architecture/);
    });
});

import { describe, it, expect } from "vitest";
import { classify } from "./Classify";
import { CommitType } from "@Utils/Constants";

describe("classify()", () => {
    const cases: [string, CommitType][] = [
        ["Implemented new function", "adaptive"],
        ["Fixed a bug in develop", "corrective"],
        ["Developed a bug in fix", "adaptive"],
        ["Wrote README", "perfective"],
        ["Meow meow meow meow", "unknown"],
    ];

    it.each(cases)("\"%s\" → %s", (message: string, expected: CommitType) => {
        expect(classify(message)).toBe(expected);
    });
});

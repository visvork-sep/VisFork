import { CommitType } from "../Constants";

/**
 * Dictionary used to classify contents of commit messages into commit types.
 * Sorted in three categories:
 * - Adaptive: Changes that add new features or functionality to the codebase.
 * - Corrective: Changes that fix bugs or issues in the codebase.
 * - Perfective: Changes that improve the codebase without adding new features or fixing bugs.
 */
const adaptiveTerms = [
    //"\\badd(?:s|ed|ing)?\\b",
    "creat(?:e|es|ed|ing)",
    "implement(?:s|ed|ing)?",
    "(?:im)?port(?:s|ed|ing)?",
    "introduc(?:e|es|ed|ing)",
    "develop(?:ed|es|ing)",
    "provid(?:e|es|ed|ing)",
    "updat(?:e|es|ed|ing)",
    "upgrad(?:e|es|ed|ing)",
    "(?:un)?hid(?:e|es|den)",
    "allow(?:s|ed|ing)?",
    "buil(?:t|ds|d|ding)",
    "calibrat(?:e|es|ed|ing)",
    "configur(?:e|es|ed|ing)",
    "deferr(?:ed|s|ing)?",
    "enhanc(?:e|es|ed|ing)",
    "extend(?:s|ed|ing)?",
    "report(?:s|ed|ing)?",
    "support(s|ed|ing)?",
    "feature(?:s)?"
];

const correctiveTerms = [
    "bug(?:s|ged|ging)?",
    "bug(?:-|s)?fix(es)?",
    "defect(?:ive)?",
    "disabl(?:e|es|ed|ing)",
    "error(?:s)?",
    "fail(?:ure|ing|es|ed)",
    "fault(?:y|s)?",
    "fix(?:ed|es|ing)?",
    "incorrect(?:ly)?",
    "mistake(?:s|n|nly)?",
    "problem(?:s)?",
    "issue(?:s)?",
];

const perfectiveTerms = [
    "doc(?:s)?",
    "docum(?:ent|entation)(?:s)?",
    "styl(?:e|es|ing)",
    "typo(?:s)?",
    "refactor(?:ed|s|ing)?",
    "re(?:-|)factor(?:ed|s|ing)?",
    "re(?:-|)format(?:ted|s|ting)?",
    "readme",
    "comment(?:s|ed|ing)?",
];

const adaptiveRegex   = new RegExp(adaptiveTerms.join("|"), "i");
const correctiveRegex = new RegExp(correctiveTerms.join("|"), "i");
const perfectiveRegex = new RegExp(perfectiveTerms.join("|"), "i");

/**
 * Tries to classify a commit message into the first category it matches, in order.
 * In the case that no category is matched, it returns "unknown".
 */
export function classify(text: string): CommitType {
    if (adaptiveRegex.test(text))   return "adaptive";
    if (correctiveRegex.test(text)) return "corrective";
    if (perfectiveRegex.test(text)) return "perfective";
    return "unknown";
}


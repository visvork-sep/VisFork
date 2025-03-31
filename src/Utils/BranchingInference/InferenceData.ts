import { UnprocessedCommitExtended } from "@Types/LogicLayerTypes";

export interface CommitLocation {
    branch: string,
    repo: string
}

// maps owner to its repo. E.g. { "me": "me/my-repo" }
export const ownerRepoMap = new Map<string, string>();
// maps a commit's hash to all of its locations in the gathered data
export const commitLocationMap = new Map<string, CommitLocation[]>();
// maps a commit's hash to the rest of its info
export const commitMap = new Map<string, UnprocessedCommitExtended>();
// maps a JSON string of the CommitLocation of a commit to its info
// This map will only contain commits at the end of a branch
// In other words: this map contains the commits that each branch points to
// https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell
export const locationHeadCommitMap = new Map<string, UnprocessedCommitExtended>();
// Maps the hash of all commits at the end of a branch to their locations.
export const locationHeadCommitMapReversed = new Map<string, CommitLocation[]>();
export let globalDefaultBranches: Record<string, string>;
export let globalMainRepo: string;

export function initializeBranchData(defaultBranches: Record<string, string>, mainRepo: string) {
    globalDefaultBranches = defaultBranches;
    globalMainRepo = mainRepo;
}

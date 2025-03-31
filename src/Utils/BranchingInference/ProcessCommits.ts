import { UnprocessedCommitExtended } from "@Types/LogicLayerTypes";
import { deleteDuplicateCommits } from "./deleteDuplicateCommits";
import { CommitLocation, 
    ownerRepoMap,
    commitLocationMap,
    commitMap,
    locationHeadCommitMap,
    locationHeadCommitMapReversed,
    initializeBranchData} from "./InferenceData";


/**
 * Initializes data structures to be used for processing the commits, after which it calls
 * {@link removeParentIds} and {@link deleteDuplicateCommits}.
 * 
 * @param rawCommits commits array to be processed
 * @param defaultBranches a map of key-value pairs where the keys are every repo name and the values are
 * the default branches of those repos. Example (with only 1 element): { "torvalds/linux": "main" }
 * @param mainRepo the name of the queried repository. Example: torvalds/linux
 * @returns an array of processed commits where each commit's parentIds array will only contain hashes
 * of commits present in the array and where no duplicate commits exist
 */
export function processCommits(rawCommits: UnprocessedCommitExtended[],
    defaultBranches: Record<string, string>,
    mainRepo: string): UnprocessedCommitExtended[] {
    // Initialize data structures
    commitLocationMap.clear();
    ownerRepoMap.clear();
    commitMap.clear();
    locationHeadCommitMap.clear();
    locationHeadCommitMapReversed.clear();
    initializeBranchData(defaultBranches, mainRepo);
    for (const rawCommit of rawCommits) {
        const locationArray: CommitLocation[] = commitLocationMap.get(rawCommit.sha) ?? [];
        locationArray.push({ branch: rawCommit.branch as string, repo: rawCommit.repo });
        commitLocationMap.set(rawCommit.sha, locationArray);
        commitMap.set(rawCommit.sha, rawCommit);
        const key = JSON.stringify({ repo: rawCommit.repo, branch: rawCommit.branch });
        const headCommit = locationHeadCommitMap.get(key);
        if (rawCommit.date !== "Unknown"
            && (headCommit === undefined || (headCommit.date as Date).getTime() < (rawCommit.date as Date).getTime())) {
            locationHeadCommitMap.set(
                key, rawCommit
            );
        }
        const owner = rawCommit.repo.split("/")[0];
        ownerRepoMap.set(owner, rawCommit.repo);
    }
    // Reverse locationHeadCommitMap to make it useful for our purpose
    for (const entry of locationHeadCommitMap.entries()) {
        const locations: CommitLocation[] = locationHeadCommitMapReversed.get(entry[1].sha) ?? [];
        locations.push(JSON.parse(entry[0]));
        locationHeadCommitMapReversed.set(entry[1].sha, locations);
    }

    // Remove parentIds that dont exist in data
    removeParentIds(rawCommits, commitMap);

    return deleteDuplicateCommits(rawCommits);
}

/**
 * Checks for each commit in its input whether it has parentIds that are not in the data.
 * If it does, it deletes just those parentIds.
 * 
 * @param rawCommits commits for the parentIds to be filtered on
 */
function removeParentIds(rawCommits: UnprocessedCommitExtended[], commitMap: Map<string, UnprocessedCommitExtended>) {
    for (const rawCommit of rawCommits) {
        for (const parent of rawCommit.parentIds) {
            if (!commitMap.get(parent)) {
                rawCommit.parentIds = rawCommit.parentIds.filter((p) => p != parent);
            }
        }
    }
}

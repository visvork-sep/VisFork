import { UnprocessedCommitExtended } from "@Types/LogicLayerTypes";
import {
    CommitLocation,
    ownerRepoMap,
    commitLocationMap,
    commitMap,
    locationHeadCommitMap,
    locationHeadCommitMapReversed,
    globalDefaultBranches,
    globalMainRepo
} from "./InferenceData";

/**
 * Deletes commits that have the same hashes, leaving a single unique commit.
 * This can only happen if the commit is present on multiple branches.
 * This function aims to preserve the branching logic by inspecting merge commits.
 * In case you are confused about some part of the implementation, the answer to your question
 * is almost always "Because that's how they decided Git/GitHub should work".
 *
 * @param rawCommits array of all commits to be analyzed and processed.
 * @returns array of commits with only unique hashes. If there was a commit with a certain hash
 * in the input, a commit with the same hash will always be present in the output.
 */
export function deleteDuplicateCommits(rawCommits: UnprocessedCommitExtended[]): UnprocessedCommitExtended[] {
    // Iterate over all commits and find the merge commits
    for (const rawCommit of rawCommits) {
        if (rawCommit.parentIds.length > 1) {
            if (rawCommit.parentIds.length > 2) {
                console.error("Found a commit with more than 2 parentIds");
            } else {
                // recursivity yippee
                recursiveMergeCheck(rawCommit);
            }
        }
    }
    // Find all duplicate commits and get rid of them with priority given to main repo and default branches
    const duplicateCommits = [...commitLocationMap.entries()].filter(([, locations]) => {
        return locations.length >= 2;
    });
    for (const duplicateCommit of duplicateCommits) {
        const duplicateCommitInfo = commitMap.get(duplicateCommit[0]);
        if (duplicateCommitInfo !== undefined) {
            makeUniqueHierarchical(duplicateCommitInfo);
        }
    }
    // From commitLocationMap, derive the true location of each commit
    const processedCommits: UnprocessedCommitExtended[] = [];
    for (const commit of commitLocationMap) {
        if (commit[1].length > 1) {
            console.error("Found more than one location for a commit!");
        }
        if (commit[1].length === 0) {
            console.error("Found no locations associated with a commit, commit got deleted!");
            continue;
        }
        const commitInfo = commitMap.get(commit[0]);
        if (commitInfo !== undefined) {
            commitInfo.branch = commit[1][0].branch;
            commitInfo.repo = commit[1][0].repo;
            const regex = /(github\.com\/)[^/]+\/[^/]+/;
            commitInfo.url = commitInfo.url.replace(regex, `$1${commit[1][0].repo}`);
            processedCommits.push(commitInfo);
        } else {
            console.error("Commit data not found!");
        }
    }
    // Necessary to ensure consistency in next runs
    commitLocationMap.clear();
    ownerRepoMap.clear();
    commitMap.clear();
    locationHeadCommitMap.clear();
    locationHeadCommitMapReversed.clear();
    return processedCommits;
}

/**
 * Makes a single commit unique according to some basic priority logic
 *
 * @param commit the commit to make unique
 */
export function makeUniqueHierarchical(commit: UnprocessedCommitExtended) {
    let locations = commitLocationMap.get(commit.sha);
    if (locations === undefined) {
        console.error("Commit locations not found!");
        locations = [];
    }
    // If there are multiple of this commit, take action
    if (locations.length >= 2) {
        const defaultBranchLocations = locations.filter(({ branch, repo }) => {
            return branch === globalDefaultBranches[repo];
        });
        if (defaultBranchLocations.some(({ repo }) => {
            return repo === globalMainRepo;
        })) {
            // Delete everywhere else but main repo and default branch of main repo
            commitLocationMap
                .set(commit.sha, [{ repo: globalMainRepo, branch: globalDefaultBranches[globalMainRepo] }]);
        } else if (defaultBranchLocations.length >= 1) {
            // Delete everywhere else but a random branch where this commit is on its default branch
            commitLocationMap.set(commit.sha, [getMinimumCommitLocation(defaultBranchLocations)]);
        } else {
            // Choose random branch and delete everywhere else
            commitLocationMap.set(commit.sha, [getMinimumCommitLocation(locations)]);
        }
    }
}

/**
 * Scheme:
 * check second parent sha and see where else you can find it.
 * if it's at a head of a branch, infer it's from there
 * if it's not at any head, but there are duplicates (it's present on other branches too),
 * infer it's from any other random branch, prioritizing default branch (semantically the same)
 * if there are no duplicates either, someone forgor to git pull
 * THIS IS THE WHOLE SCHEME OF FINDING WHERE THE COMMIT CAME FROM
 *
 * now go to that branch and start deleting the duplicates everywhere else.
 * when encountering another merge commit, recursively do the same thing,
 * and afterwards continue deleting duplicates of itself again
 *
 * @param mergeCommit the commit to check duplicates from
 */
function recursiveMergeCheck(mergeCommit: UnprocessedCommitExtended) {
    // If this merge commit already got handled before, don't handle it again
    if (isHandledBefore(mergeCommit)) {
        return;
    }
    // Get relevant data
    const mergeBaseCommit = findMergeBaseCommit(mergeCommit.parentIds[0], mergeCommit.parentIds[1]) ?? "";
    const secondParent = commitMap.get(mergeCommit.parentIds[1]);
    const commitLocations = commitLocationMap.get(mergeCommit.parentIds[1]) ?? [];
    if (secondParent === undefined) {
        console.error("Second parent not found!");
        return;
    }
    // Get all perfect branches
    const allBranchesWithRelevantHeadCommit = locationHeadCommitMapReversed.get(secondParent.sha);
    if (allBranchesWithRelevantHeadCommit?.length) { // found a perfect branch!
        deleteFromBranch(secondParent, allBranchesWithRelevantHeadCommit[0], mergeBaseCommit);
    } else if (hasDuplicates(commitLocations)) { // parentId in fetched data and has duplicates
        // Try inferring whether this commit is from a PR and has a default message and get its branch from it
        deleteFromPRBranch(mergeCommit, commitLocations, secondParent, mergeBaseCommit);
        // No inference could be made: apply priority rules and gamble
        const nonMainRepoCommitLocations = commitLocations.filter(({ repo }) => {
            return repo !== globalMainRepo;
        });
        if (nonMainRepoCommitLocations.length >= 1) {
            deleteFromBranch(secondParent, getMinimumCommitLocation(nonMainRepoCommitLocations), mergeBaseCommit);
        } else { // Complete gamble
            deleteFromBranch(secondParent, getMinimumCommitLocation(commitLocations), mergeBaseCommit);
        }

    }
    // Remaining conditions only include situations with no duplicates
}

function isHandledBefore(mergeCommit: UnprocessedCommitExtended): boolean {
    return (commitLocationMap.get(mergeCommit.parentIds[1])?.length ?? 0) === 1;
}

function hasDuplicates(commitLocations: CommitLocation[]): boolean {
    return commitLocations.length > 1;
}

function deleteFromPRBranch(
    mergeCommit: UnprocessedCommitExtended,
    commitLocations: CommitLocation[],
    secondParent: UnprocessedCommitExtended,
    mergeBaseCommit: string
): boolean {
    const match = mergeCommit.message.match(/^merge pull request .* from ([^\s]+).*/i);
    if (!match) return false;

    const [owner, branch_name] = match[1].split("/", 2);
    const repo_name = ownerRepoMap.get(owner) ?? "";

    if (commitLocations.some(({ repo, branch }) => repo === repo_name && branch === branch_name)) {
        deleteFromBranch(secondParent, { repo: repo_name, branch: branch_name }, mergeBaseCommit);
        return true;
    }
    return false;
}

/**
 * Let's go gambling!
 * Used to deterministically get a random branch.
 *
 * @param locations all CommitLocations to get a random one from
 * @returns alphabetical minimum of commit location, first sorted on repo and then branch
 */
function getMinimumCommitLocation(locations: CommitLocation[]): CommitLocation {
    return locations.reduce((min, curr) =>
        curr.repo.localeCompare(min.repo) < 0 ||
            (curr.repo === min.repo && curr.branch.localeCompare(min.branch) < 0)
            ? curr
            : min
    );
}

/**
 * Handles the deletion of commits if we know its branch.
 *
 * @param commit commit that is a parent of a merge commit
 * @param repo repo where commit is located
 * @param branch branch where commit is located
 * @param mergeBaseCommit the commit where this repo/branch combination started deviating
 */
export function deleteFromBranch(commit: UnprocessedCommitExtended,
    { repo, branch }: CommitLocation,
    mergeBaseCommit: string | undefined) {
    if (mergeBaseCommit === undefined) {
        return;
    }
    // Do not delete this line. In edge cases, it is necessary, such as when the called commit has no parents
    commitLocationMap.set(commit.sha, [{repo, branch}]);
    commit = deleteFromBranchRecentHistory(commit, mergeBaseCommit, repo, branch);

    // In case this is the only branch containing this history, we do not delete the history
    if ((commitLocationMap.get(mergeBaseCommit)?.length ?? []) === 1) {
        return;
    }

    // We have now arrived at duplicated history from the branch, so we delete itself from
    // the commit locations associated with the commit's hash
    commit = deleteBranchFromOldHistory(commit, branch, repo);
}

function deleteBranchFromOldHistory(commit: UnprocessedCommitExtended, branch: string, repo: string) {
    while (true) {
        const currentLocations = commitLocationMap.get(commit.sha);
        if (currentLocations === undefined) {
            console.error("Commit location not found!");
        } else {
            // Delete the branch itself from this commit's hash
            // First check whether we are not making a commit disappear
            if (!currentLocations.every(({ branch: branch_name, repo: repo_name }) => {
                return branch_name === branch && repo_name === repo;
            })) {
                commitLocationMap.set(commit.sha, 
                    currentLocations.filter(({ branch: branch_name, repo: repo_name }) => {
                        return !(branch_name === branch && repo_name === repo);
                    }));
            }
        }

        // We have arrived at the end of its history
        if (commit.parentIds.length === 0) {
            break;
        }

        // We go to the parent commit and continue execution
        const nextCommit = commitMap.get(commit.parentIds[0]);
        if (nextCommit === undefined) {
            console.error("Commit data not found!");
            break;
        } else {
            commit = nextCommit;
        }
    }
    return commit;
}

function deleteFromBranchRecentHistory(commit: UnprocessedCommitExtended, 
    mergeBaseCommit: string, 
    repo: string, 
    branch: string) {
    while (commit.parentIds.length !== 0 && commit.sha !== mergeBaseCommit) {
        // Set the current commit to the given repo and branch, since we have determined it's from there.
        commitLocationMap.set(commit.sha, [{ repo, branch }]);
        // If the current commit is also a merge commit, handle that one too
        if (commit.parentIds.length === 2 && commitLocationMap.get(commit.parentIds[1])?.length !== 1) {
            recursiveMergeCheck(commit);
        }

        // Go to parent commit and keep assigning it to the given commit location
        const nextCommit = commitMap.get(commit.parentIds[0]);
        if (nextCommit === undefined) {
            console.error("Commit data not found!");
            break;
        } else {
            commit = nextCommit;
        }
    }
    return commit;
}

/**
 * Aims to find the commit returned by the `git merge-base parent1 parent2` command.
 * for more info see here https://git-scm.com/docs/git-merge-base
 *
 * @param parent1 sha of first parent commit of merge commit, by convention the last commit on branch
 * @param parent2 sha of second parent commit of merge commit, by convention the last commit on branch that got merged
 * @returns sha of merge-base commit
 */
export function findMergeBaseCommit(parent1: string, parent2: string): string | undefined {

    // Simple BFS algorithm to return all ancestors
    function getAncestors(startNode: string): Set<string> {
        const ancestors = new Set<string>();
        const queue = [startNode];

        while (queue.length > 0) {
            const node = queue.shift();
            if (node !== undefined && !ancestors.has(node)) {
                ancestors.add(node);
                if (!commitMap.has(node)) {
                    console.error("Commit data not found!");
                } else {
                    const parents = commitMap.get(node)?.parentIds; // Use optional chaining
                    if (parents) {
                        queue.push(...parents); // Add all parents to the queue
                    }
                }
            }
        }
        return ancestors;
    }

    // Get ancestor set for first parent
    const ancestorsA = getAncestors(parent1);

    // Find the first common ancestor by BFS from the second parent's ancestor list
    const queue = [parent2];
    const visited = new Set(); // Track visited nodes

    // Another BFS execution with an early return once we find the first common ancestor
    while (queue.length > 0) {
        const node = queue.shift();
        if (node !== undefined && !visited.has(node)) {
            if (ancestorsA.has(node)) {
                return node; // First common ancestor found
            }
            visited.add(node);
            if (!commitMap.has(node)) {
                console.error("Commit data not found!");
            } else {
                const parents = commitMap.get(node)?.parentIds;
                if (parents) {
                    queue.push(...parents);
                }
            }
        }
    }

    return undefined; // No common ancestor found
}

import { UnprocessedCommitExtended } from "@Types/LogicLayerTypes";

interface CommitLocation {
    branch: string,
    repo: string
}

// maps owner to its repo. E.g. { "me": "me/my-repo" }
const ownerRepoMap = new Map<string, string>();
// maps a commit's hash to all of its locations in the gathered data
const commitLocationMap = new Map<string, CommitLocation[]>();
// maps a commit's hash to the rest of its info
const commitMap = new Map<string, UnprocessedCommitExtended>();
// maps a JSON string of the CommitLocation of a commit to its info
// This map will only contain commits at the end of a branch
// In other words: this map contains the commits that each branch points to
// https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell
const locationHeadCommitMap = new Map<string, UnprocessedCommitExtended>();
// Maps the hash of all commits at the end of a branch to their locations.
const locationHeadCommitMapReversed = new Map<string, CommitLocation[]>();
let globalDefaultBranches: Record<string, string>;
let globalMainRepo: string;

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
    globalDefaultBranches = defaultBranches;
    globalMainRepo = mainRepo;
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
    removeParentIds(rawCommits);

    return deleteDuplicateCommits(rawCommits);
}

/**
 * Checks for each commit in its input whether it has parentIds that are not in the data.
 * If it does, it deletes just those parentIds.
 * 
 * @param rawCommits commits for the parentIds to be filtered on
 */
function removeParentIds(rawCommits: UnprocessedCommitExtended[]) {
    for (const rawCommit of rawCommits) {
        for (const parent of rawCommit.parentIds) {
            if (!commitMap.get(parent)) {
                rawCommit.parentIds = rawCommit.parentIds.filter((p) => p != parent);
            }
        }
    }
}

/**
 * Deletes commits that have the same hashes, leaving a single unique commit.
 * This can only happen if the commit is present on multiple branches.
 * This function aims to preserve the branching logic by inspecting merge commits.
 * In case you are confused about some part of the implementation, the answer to your question
 * is almost always "Because that's how they decided Git/GitHub should work".
 *
 * @param rawCommits array of all commits to be analyzed and processed.
 * @param defaultBranches a map of key-value pairs where the keys are every repo name and the values are
 * the default branches of those repos. Example (with only 1 element): { "torvalds/linux": "main" }
 * @param mainRepo the name of the queried repository. Example: torvalds/linux
 * @returns array of commits with only unique hashes. If there was a commit with a certain hash
 * in the input, a commit with the same hash will always be present in the output.
 */
function deleteDuplicateCommits(rawCommits: UnprocessedCommitExtended[]): UnprocessedCommitExtended[] {
    // Iterate over all commits and find the merge commits
    for (const rawCommit of rawCommits) {
        if (rawCommit.parentIds.length > 1) {
            if (rawCommit.parentIds.length > 2) {
                console.log("Found a commit with more than 2 parentIds");
            } else {
                // recursivity yippee
                recursiveMergeCheck(rawCommit);
            }
        }
    }
    /**
     * Scheme:
     * for the headCommit of each branch, check if duplicate
     * go to parentId (if 2, pick the first one)
     * if duplicates are found, delete the ones that arent on default branch
     * if there are no duplicates on default branch, randomly select a branch to not delete duplicates from
     * recursively delete duplicates of everything except the chosen branch until parentIds is empty
     */
    const headCommits = [...locationHeadCommitMap.values()];
    for (let headCommit of headCommits) {
        makeUniqueHierarchical(headCommit);
        while (headCommit.parentIds.length !== 0) {
            const nextCommit = commitMap.get(headCommit.parentIds[0]);
            if (nextCommit === undefined) {
                console.error("Commit data not found!");
                headCommit = {sha: "",id: "",parentIds: [],node_id: "",author: "",date: new Date(),url: "",message: ""
                    ,repo: "",branch: ""};
            } else {
                headCommit = nextCommit;
            }
            makeUniqueHierarchical(headCommit);
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
function makeUniqueHierarchical(commit: UnprocessedCommitExtended) {
    let locations = commitLocationMap.get(commit.sha);
    if (locations === undefined) {
        console.error("Commit locations not found!");
        locations = [];
    }
    // If there are multiple of this commit, take action
    if (locations.length >= 2) {
        const defaultBranchLocations = locations.filter(({branch, repo}) => {
            return branch === globalDefaultBranches[repo];
        });
        if (defaultBranchLocations.some(({repo}) => {
            return repo === globalMainRepo;
        })) {
            // Delete everywhere else but main repo and default branch of main repo
            commitLocationMap.set(commit.sha, [{repo: globalMainRepo, branch: globalDefaultBranches[globalMainRepo]}]);
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
    if ((commitLocationMap.get(mergeCommit.parentIds[1])?.length ?? []) === 1) {
        return;
    }
    // Get relevant data
    const mergeBaseCommit = findMergeBaseCommit(mergeCommit.parentIds[0], mergeCommit.parentIds[1]);
    const secondParent = commitMap.get(mergeCommit.parentIds[1]);
    const commitLocations = commitLocationMap.get(mergeCommit.parentIds[1]);
    if (secondParent === undefined) {
        console.error("Second parent not found!");
        return;
    }
    // Get all perfect branches
    const allBranchesWithRelevantHeadCommit = locationHeadCommitMapReversed.get(secondParent.sha);
    if (allBranchesWithRelevantHeadCommit !== undefined) {
        if (allBranchesWithRelevantHeadCommit.length === 0) {
            console.error("Found no relevant head commits due to mistake in data structure!");
        } else if (allBranchesWithRelevantHeadCommit.length >= 1) { // found a perfect branch!
            deleteFromBranch(secondParent, allBranchesWithRelevantHeadCommit[0], mergeBaseCommit);
        }
    } else if (commitLocations !== undefined
        && commitLocations.length > 1) { // parentId in fetched data and has duplicates
        // Try inferring whether this commit is from a PR and has a default message and get its branch from it
        const regex = /^merge pull request .* from ([^\s]+).*/i;
        const match = mergeCommit.message.match(regex);
        if (match !== null) {
            const [owner, branch_name] = match[1].split("/", 2);
            let repo_name = ownerRepoMap.get(owner);
            if (!repo_name) {
                repo_name = "";
            }
            if (commitLocations.some(({repo, branch}) => {
                return repo === repo_name && branch === branch_name;
            })) {
                deleteFromBranch(secondParent, {repo: repo_name, branch: branch_name}, mergeBaseCommit);
                return;
            }
        }
        // No inference could be made: apply priority rules and gamble
        const nonMainRepoCommitLocations = commitLocations.filter(({repo}) => {
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

/**
 * Handles the deletion of commits if we know its branch.
 *
 * @param commit commit that is a parent of a merge commit
 * @param repo repo where commit is located
 * @param branch branch where commit is located
 * @param mergeBaseCommit the commit where this repo/branch combination started deviating
 */
function deleteFromBranch(commit: UnprocessedCommitExtended,
    {repo, branch}: CommitLocation,
    mergeBaseCommit: string | undefined) {
    if (mergeBaseCommit === undefined) {
        return;
    }
    // Do not delete this line. In edge cases, it is necessary, such as when the called commit has no parents
    commitLocationMap.set(commit.sha, [{repo, branch}]);
    while (commit.parentIds.length !== 0 && commit.sha !== mergeBaseCommit) {
        // Set the current commit to the given repo and branch, since we have determined it's from there.
        commitLocationMap.set(commit.sha, [{repo, branch}]);
        // If the current commit is also a merge commit, handle that one too
        if (commit.parentIds.length === 2 && commitLocationMap.get(commit.parentIds[1])?.length !== 1) {
            recursiveMergeCheck(commit);
        }

        // Go to parent commit and keep assigning it to the given commit location
        const nextCommit = commitMap.get(commit.parentIds[0]);
        if (nextCommit === undefined) {
            console.error("Commit data not found!");
            commit = {sha: "",id: "",parentIds: [],node_id: "",author: "",date: new Date(),url: "",message: "",
                repo: "",branch: ""};
        } else {
            commit = nextCommit;
        }
    }

    // In case this is the only branch containing this history, we do not delete the history
    if ((commitLocationMap.get(mergeBaseCommit)?.length ?? []) === 1) {
        return;
    }

    // We have now arrived at duplicated history from the branch, so we delete itself from
    // the commit locations associated with the commit's hash
    while (true) {
        const currentLocations = commitLocationMap.get(commit.sha);
        if (currentLocations === undefined) {
            console.error("Commit location not found!");
        } else {
            // Delete the branch itself from this commit's hash
            // First check whether we are not making a commit disappear
            if (!currentLocations.every(({branch: branch_name, repo: repo_name}) => {
                return branch_name === branch && repo_name === repo;
            })) {
                commitLocationMap.set(commit.sha, currentLocations.filter(({branch: branch_name, repo: repo_name}) => {
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
            commit = {sha: "",id: "",parentIds: [],node_id: "",author: "",date: new Date(),url: "",message: "",
                repo: "",branch: ""};
        } else {
            commit = nextCommit;
        }
    }
}

/**
 * Aims to find the commit returned by the `git merge-base parent1 parent2` command.
 * for more info see here https://git-scm.com/docs/git-merge-base
 *
 * @param parent1 sha of first parent commit of merge commit, by convention the last commit on branch
 * @param parent2 sha of second parent commit of merge commit, by convention the last commit on branch that got merged
 * @returns sha of merge-base commit
 */
function findMergeBaseCommit(parent1: string, parent2: string): string | undefined {

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

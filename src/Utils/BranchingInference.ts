import { CommitInfo } from "@Types/LogicLayerTypes";

interface CommitLocation {
    branch: string,
    repo: string
}

const commitLocationMap = new Map<string, CommitLocation[]>();
const commitMap = new Map<string, CommitInfo>();
const locationHeadCommitMap = new Map<string, CommitInfo>();
const locationHeadCommitMapReversed = new Map<string, CommitLocation[]>();
let globalDefaultBranches: Record<string, string>;
let globalMainRepo: string;

/**
 * Deletes commits that have the same hashes, leaving a single unique commit. 
 * This can only happen if the commit is present on multiple branches.
 * This algorithm uses a very simple approach to make sure the deletion makes sense somewhat, but
 * in no way actually considers merge commits or does any inference, except for prioritizing 
 * the main repo and default branches.
 * 
 * @param rawCommits array of all commits to be analyzed and processed.
 * @param defaultBranches a map of key-value pairs where the keys are every repo name and the values are 
 * the default branches of those repos. Example (with only 1 element): { "torvalds/linux": "main" }
 * @param mainRepo the name of the queried repository. Example: torvalds/linux
 * @returns array of commits with only unique hashes. If there was a commit with a certain hash
 * in the input, a commit with the same hash will always be present in the output.
 */
export function deleteDuplicateCommitsSimple(rawCommits: CommitInfo[],
    defaultBranches: Record<string, string>,
    mainRepo: string
): CommitInfo[] {
    for (const rawCommit of rawCommits) {
        const locationArray: CommitLocation[] = commitLocationMap.get(rawCommit.sha) ?? [];
        locationArray.push({ branch: rawCommit.branch_name as string, repo: rawCommit.repo });
        commitLocationMap.set(rawCommit.sha, locationArray);
        commitMap.set(rawCommit.sha, rawCommit);
    }
    const duplicateCommits = [...commitLocationMap.entries()].filter(([, locations]) => {
        return locations.length >= 2;
    });
    for (const duplicateCommit of duplicateCommits) {
        const mainRepoCommits = duplicateCommit[1].filter(({ repo }) => repo === mainRepo);
        if (mainRepoCommits.some(({ branch }) => branch === defaultBranches[mainRepo])) {
            commitLocationMap.set(duplicateCommit[0], [{repo: mainRepo, branch: defaultBranches[mainRepo]}]);
        } else if (mainRepoCommits.length >= 1) {
            commitLocationMap.set(duplicateCommit[0], [getMinimumCommitLocation(mainRepoCommits)]);
        } else {
            commitLocationMap.set(duplicateCommit[0], [getMinimumCommitLocation(duplicateCommit[1])]);
        }
    }
    const processedCommits: CommitInfo[] = [];
    for (const commit of commitLocationMap) {
        if (commit[1].length > 1) {
            console.error("Mistake in data structure encountered!");
        }
        if (commit[1].length === 0) {
            console.error("Critical mistake in data structure encountered!");
            continue;
        }
        const commitInfo = commitMap.get(commit[0]);
        if (commitInfo !== undefined) {
            commitInfo.branch_name = commit[1][0].branch;
            commitInfo.repo = commit[1][0].repo;
            processedCommits.push(commitInfo);
        } else {
            console.error("Critical mistake in data structure encountered!");
        }
    }
    return processedCommits;
}

// Let's go gambling!
// Returns alphabetical minimum of commit location, first sorted on repo and then branch
function getMinimumCommitLocation(locations: CommitLocation[]): CommitLocation {
    return locations.reduce((min, curr) =>
        curr.repo.localeCompare(min.repo) < 0 ||
        (curr.repo === min.repo && curr.branch.localeCompare(min.branch) < 0)
            ? curr
            : min
    );
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
 * 
 * @deprecated DO NOT USE!!!! Use {@link deleteDuplicateCommitsSimple} instead for now.
 */
export function deleteDuplicateCommits(rawCommits: CommitInfo[], 
    defaultBranches: Record<string, string>, // format: { repo: branch }
    mainRepo: string): CommitInfo[] {
    globalDefaultBranches = defaultBranches;
    globalMainRepo = mainRepo;
    //rawCommits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // might be optional
    for (const rawCommit of rawCommits) {
        const locationArray: CommitLocation[] = commitLocationMap.get(rawCommit.sha) ?? [];
        locationArray.push({ branch: rawCommit.branch_name as string, repo: rawCommit.repo });
        commitLocationMap.set(rawCommit.sha, locationArray);
        commitMap.set(rawCommit.sha, rawCommit);
        const key = JSON.stringify({ repo: rawCommit.repo, branch: rawCommit.branch_name });
        const headCommit = locationHeadCommitMap.get(key);
        if (headCommit === undefined || new Date(headCommit.date).getTime() < new Date(rawCommit.date).getTime()) {
            locationHeadCommitMap.set(
                key, rawCommit
            );
        }
    }
    for (const entry of locationHeadCommitMap.entries()) {
        const locations: CommitLocation[] = locationHeadCommitMapReversed.get(entry[1].sha) ?? [];
        locations.push(JSON.parse(entry[0]));
        locationHeadCommitMapReversed.set(entry[1].sha, locations);
    }
    for (const rawCommit of rawCommits) {
        if (rawCommit.parentIds.length > 1) {
            if (rawCommit.parentIds.length > 2) {
                console.error("Found a commit with more than 2 parentIds");
                return [];
            }
            // recursivity yippee
            recursiveMergeCheck(rawCommit);
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
                console.error("Critical mistake in data structure!");
                headCommit = {sha: "",id: "",parentIds: [],node_id: "",author: "",date: "",url: "",message: "",
                    mergedNodes: [],repo: "",branch_name: ""};
            } else {
                headCommit = nextCommit;
            }
            makeUniqueHierarchical(headCommit);
        }
    }
    const processedCommits: CommitInfo[] = [];
    for (const commit of commitLocationMap) {
        if (commit[1].length > 1) {
            console.error("Mistake in data structure encountered!");
        }
        if (commit[1].length === 0) {
            console.error("Critical mistake in data structure encountered!");
            continue;
        }
        const commitInfo = commitMap.get(commit[0]);
        if (commitInfo !== undefined) {
            commitInfo.branch_name = commit[1][0].branch;
            commitInfo.repo = commit[1][0].repo;
            processedCommits.push(commitInfo);
        } else {
            console.error("Critical mistake in data structure encountered!");
        }
    }
    return processedCommits;
}

function makeUniqueHierarchical(commit: CommitInfo) {
    let locations = commitLocationMap.get(commit.sha);
    if (locations === undefined) {
        console.error("Critical mistake in data structure!");
        locations = [];
    }
    if (locations.length >= 2) {
        const defaultBranchLocations = locations.filter(({branch, repo}) => {
            return branch === globalDefaultBranches[repo];
        });
        if (defaultBranchLocations.filter(({repo}) => {
            return repo === globalMainRepo;
        }).length === 1) {
            // delete everywhere else
            commitLocationMap.set(commit.sha, [{repo: globalMainRepo, branch: globalDefaultBranches[globalMainRepo]}]);
        } else if (defaultBranchLocations.length >= 1) {
            // delete everywhere else
            commitLocationMap.set(commit.sha, [getMinimumCommitLocation(defaultBranchLocations)]);
        } else { 
            // choose random branch and delete everywhere else
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
function recursiveMergeCheck(mergeCommit: CommitInfo) {
    if ((commitLocationMap.get(mergeCommit.parentIds[1])?.length ?? []) === 1) {
        return;
    }
    const mergeBaseCommit = findMergeBaseCommit(mergeCommit.parentIds[0], mergeCommit.parentIds[1]);
    const secondParent = commitMap.get(mergeCommit.parentIds[1]);
    const commitLocations = commitLocationMap.get(mergeCommit.parentIds[1]);
    if (secondParent === undefined) {
        console.error("Critical mistake in data structure!");
        return;
    }
    const allBranchesWithRelevantHeadCommit = locationHeadCommitMapReversed.get(secondParent.sha);
    if (allBranchesWithRelevantHeadCommit !== undefined) { 
        if (allBranchesWithRelevantHeadCommit.length === 0) {
            console.error("Critical mistake in data structure!");
        } else if (allBranchesWithRelevantHeadCommit.length >= 1) { // found perfect branch!
            deleteFromBranch(secondParent, allBranchesWithRelevantHeadCommit[0], mergeBaseCommit);
        }
    } else if (commitLocations !== undefined 
        && commitLocations.length > 1) { // parentId in fetched data and has duplicates
        let regex = /^merge pull request .* from ([^\s]+).*/i;
        let match = mergeCommit.message.match(regex);
        if (match !== null) {
            const [repo_name, branch_name] = match[1].split("/", 2);
            if (commitLocations.filter(({repo, branch}) => {
                return repo === repo_name && branch === branch_name;
            }).length === 1) {
                deleteFromBranch(secondParent, {repo: repo_name, branch: branch_name}, mergeBaseCommit);
                return;
            }
        }
        regex = /^merge branch [']([^']+)['].*/i;
        match = mergeCommit.message.match(regex);
        if (match !== null && commitLocations.filter(({branch}) => {
            return branch === match[1];
        }).length >= 1) {
            const commitLocationsFiltered = commitLocations.filter(({branch}) => {
                return branch === match[1];
            });
            if (commitLocationsFiltered.some(({repo}) => {
                return repo === globalMainRepo;
            })) {
                deleteFromBranch(secondParent, {repo: globalMainRepo, branch: match[1]}, mergeBaseCommit);
                return;
            } else {
                deleteFromBranch(secondParent, getMinimumCommitLocation(commitLocationsFiltered), mergeBaseCommit);
                return;
            }
        }
        // No inference could be made: apply priority rules and gamble
        const mainRepoCommitLocations = commitLocations.filter(({repo}) => {
            return repo === globalMainRepo;
        });
        if (mainRepoCommitLocations.filter(({branch}) => {
            return branch === globalDefaultBranches[globalMainRepo];
        }).length >= 1) {
            deleteFromBranch(secondParent, 
                {repo: globalMainRepo, branch: globalDefaultBranches[globalMainRepo]}, 
                mergeBaseCommit);
        } else if (mainRepoCommitLocations.length >= 1) {
            deleteFromBranch(secondParent, getMinimumCommitLocation(mainRepoCommitLocations), mergeBaseCommit);
        } else { // Complete gamble
            deleteFromBranch(secondParent, getMinimumCommitLocation(commitLocations), mergeBaseCommit);
        }
        
    }
    // Remaining conditions only include situations with no duplicates
}

function deleteFromBranch(commit: CommitInfo, {repo, branch}: CommitLocation, mergeBaseCommit: string | undefined) {
    commitLocationMap.set(commit.sha, [{repo, branch}]);
    while (commit.parentIds.length !== 0 && commit.sha !== mergeBaseCommit) {
        commitLocationMap.set(commit.sha, [{repo, branch}]);
        if (commit.parentIds.length === 2 && commitLocationMap.get(commit.parentIds[1])?.length !== 1) {
            recursiveMergeCheck(commit);
        }

        const nextCommit = commitMap.get(commit.parentIds[0]);
        if (nextCommit === undefined) {
            console.error("Critical mistake in data structure!");
            commit = {sha: "",id: "",parentIds: [],node_id: "",author: "",date: "",url: "",message: "",
                mergedNodes: [],repo: "",branch_name: ""};
        } else {
            commit = nextCommit;
        }
    }

    while (true) {
        const currentLocations = commitLocationMap.get(commit.sha);
        if (currentLocations === undefined) {
            console.error("Critical mistake in data structure!");
        } else {
            commitLocationMap.set(commit.sha, currentLocations.filter(({branch: branch_name, repo: repo_name}) => {
                return !(branch_name === branch && repo_name === repo);
            }));
        }
        if (commit.parentIds.length === 0) {
            break;
        }
        const nextCommit = commitMap.get(commit.parentIds[0]);
        if (nextCommit === undefined) {
            console.error("Critical mistake in data structure!");
            commit = {sha: "",id: "",parentIds: [],node_id: "",author: "",date: "",url: "",message: "",
                mergedNodes: [],repo: "",branch_name: ""};
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
    function getAncestors(startNode: string): Set<string> {
        const ancestors = new Set<string>();
        const queue = [startNode];

        while (queue.length > 0) {
            const node = queue.shift();
            if (node !== undefined && !ancestors.has(node)) {
                ancestors.add(node);
                if (!commitMap.has(node)) {
                    console.error("Critical mistake in data structure!");
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

    // Get ancestor sets for both nodes
    const ancestorsA = getAncestors(parent1);

    // Find the first common ancestor by BFS from nodeB's ancestor list
    const queue = [parent2];
    const visited = new Set(); // Track visited nodes

    while (queue.length > 0) {
        const node = queue.shift();
        if (node !== undefined && !visited.has(node)) {
            if (ancestorsA.has(node)) {
                return node; // First common ancestor found
            }
            visited.add(node);
            if (!commitMap.has(node)) {
                console.error("Critical mistake in data structure!");
            } else {
                const parents = commitMap.get(node)?.parentIds; // Use optional chaining
                if (parents) {
                    queue.push(...parents); // Add all parents to the queue
                }
            }
        }
    }

    return undefined; // No common ancestor found
}

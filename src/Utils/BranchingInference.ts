import { CommitInfo } from "@Types/LogicLayerTypes";
import exampleData from "./example.json";

interface CommitLocation {
    branch: string,
    repo: string
}

const commitLocationMap = new Map<string, CommitLocation[]>();
const commitMap = new Map<string, CommitInfo>();
const locationHeadCommitMap = new Map<CommitLocation, CommitInfo>();
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
        if (commit[1].length !== 1) {
            console.error("Mistake in data structure encountered!");
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
    rawCommits = exampleData; // DELETE THIS LINE IN PROD
    globalDefaultBranches = defaultBranches;
    globalMainRepo = mainRepo;
    rawCommits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // might be optional
    for (const rawCommit of rawCommits) {
        const locationArray: CommitLocation[] = commitLocationMap.get(rawCommit.sha) ?? [];
        locationArray.push({ branch: rawCommit.branch_name as string, repo: rawCommit.repo });
        commitLocationMap.set(rawCommit.sha, locationArray);
        commitMap.set(rawCommit.sha, rawCommit);
        const headCommit = locationHeadCommitMap.get({ branch: rawCommit.branch_name as string, repo: rawCommit.repo });
        if (headCommit === undefined || new Date(headCommit.date).getTime() < new Date(rawCommit.date).getTime()) {
            locationHeadCommitMap.set(
                { branch: rawCommit.branch_name as string, repo: rawCommit.repo }, 
                rawCommit
            );
        }
    }
    for (const entry of locationHeadCommitMap.entries()) {
        const locations: CommitLocation[] = locationHeadCommitMapReversed.get(entry[1].sha) ?? [];
        locations.push(entry[0]);
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

            // TODO after checking all merges, clean up remaining duplicate commits: these never got followed by a merge
            // YES these can exist

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
        }
    }
    
    return [];
}

function makeUniqueHierarchical(commit: CommitInfo) {
    let locations = commitLocationMap.get(commit.sha);
    if (locations === undefined) {
        console.error("Critical mistake in data structure!");
        locations = [];
    }
    if (locations.length >= 2) {
        if (locations.filter(({branch, repo}) => {
            return repo === globalMainRepo && branch === globalDefaultBranches[globalMainRepo];
        }).length === 1) {
            // delete everywhere else
        } else if (locations.filter(({branch, repo}) => {
            return branch === globalDefaultBranches[repo];
        }).length >= 1) {
            // delete everywhere else
        } else { 
            // choose random branch and delete everywhere else
        }
    }
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
    const mergeBaseCommit = findMergeBaseCommit(mergeCommit.parentIds[0], mergeCommit.parentIds[1]);
    console.log(mergeBaseCommit);
    const allBranchesWithRelevantHeadCommit = locationHeadCommitMapReversed.get(mergeCommit.parentIds[1]);
    let commitLocations;
    if (allBranchesWithRelevantHeadCommit !== undefined) { 
        if (allBranchesWithRelevantHeadCommit.length === 1) { // found perfect branch!
            
        } else { // more than one perfect branch found, pick a random one

        }
    } else if ((commitLocations = commitLocationMap.get(mergeCommit.parentIds[1])) !== undefined 
        && commitLocations.length > 1) { // parentId in fetched data and has duplicates
        // prioritize default branch!
    }
    // Remaining conditions only include situations with no duplicates
}

/**
 * Aims to find the commit returned by the `git merge-base parent1 parent2` command.
 * for more info see here https://git-scm.com/docs/git-merge-base
 * 
 * @param parent1 sha of first parent commit of merge commit, by convention the last commit on branch
 * @param parent2 sha of second parent commit of merge commit, by convention the last commit on branch that got merged
 * @returns sha of merge-base commit
 */
function findMergeBaseCommit(parent1: string, parent2: string): string {
    // API call goes here, or maybe not and I lose reasonable hairline privileges
    console.log("parent1: " + parent1);
    console.log("parent2: " + parent2);
    return "fresh";
}

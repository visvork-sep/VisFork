import { CommitInfo } from "@Types/DataLayerTypes";
import exampleData from "./example.json";

interface CommitLocation {
    branch: string,
    repo: string
}

/**
 * Deletes commits that have the same hashes, leaving a single unique commit. 
 * This can only happen if the commit is present on multiple branches.
 * This function aims to preserve the branching logic by inspecting merge commits.
 * 
 * @param rawCommits array of all commits to be analyzed and processed.
 * @returns array of commits with only unique hashes. If there was a commit with a certain hash
 * in the input, a commit with the same hash will always be present in the output.
 */
export function deleteDuplicateCommits(rawCommits: CommitInfo[]): CommitInfo[] {
    rawCommits = exampleData;
    rawCommits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    console.log(rawCommits);
    const commitMap = new Map<string, CommitLocation[]>();
    const locationHeadCommitMap = new Map<CommitLocation, CommitInfo>();
    let processedCommits: CommitInfo[] = [];
    for (const rawCommit of rawCommits) {
        const locationArray: CommitLocation[] = commitMap.get(rawCommit.sha) ?? [];
        locationArray.push({ branch: rawCommit.branch_name as string, repo: rawCommit.repo });
        commitMap.set(rawCommit.sha, locationArray);
        const headCommit = locationHeadCommitMap.get({ branch: rawCommit.branch_name as string, repo: rawCommit.repo });
        if (headCommit === undefined || new Date(headCommit.date).getTime() < new Date(rawCommit.date).getTime()) {
            locationHeadCommitMap.set(
                { branch: rawCommit.branch_name as string, repo: rawCommit.repo }, 
                rawCommit
            );
        }
    }
    for (const rawCommit of rawCommits) {
        if (rawCommit.parentIds.length > 1) {
            if (rawCommit.parentIds.length > 2) {
                console.error("Found a commit with more than 2 parentIds");
                return [];
            }
            recursiveMergeCheck(rawCommit);
            // recursivity yippee

            /**
             * Scheme:
             * check second parent sha and see where else you can find it.
             * if it's at a head of a branch, infer it's from there
             * if it's not at any head, but there are duplicates (it's present on other branches too), 
             * infer it's from any other random branch (semantically the same)
             * if there are no duplicates either, someone forgor to git pull
             * THIS IS THE WHOLE SCHEME OF FINDING WHERE THE COMMIT CAME FROM
             * 
             * now go to that branch and start deleting the duplicates everywhere else.
             * when encountering another merge commit, recursively do the same thing,
             * and afterwards continue deleting duplicates of itself again
             */

            // TODO after checking all merges, clean up remaining duplicate commits: these never got followed by a merge
            // YES these can exist

            /**
             * Scheme:
             * for the head commit of each branch
             * check if it's a duplicate, if it isn't, go to parentId (if 2, pick the first one)
             * if duplicates are found, delete the ones that arent on default branch
             * if there are no duplicates on default branch, randomly select a branch to not delete duplicates from
             * recursively delete duplicates of everything except the chosen branch until parentIds is empty
             */
        }
    }
    
    return [];
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
    // API call goes here
    console.log("parent1: " + parent1);
    console.log("parent2: " + parent2);
    return "fresh";
}

function recursiveMergeCheck(mergeCommit: CommitInfo) {
    const mergeBaseCommit = findMergeBaseCommit(mergeCommit.parentIds[0], mergeCommit.parentIds[1]);
}

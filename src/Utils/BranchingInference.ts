import { CommitInfo } from "@Types/DataLayerTypes";
import exampleData from "./example.json";

export function deleteDuplicateCommits(rawCommits: CommitInfo[]): CommitInfo[] {
    rawCommits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return [];
}

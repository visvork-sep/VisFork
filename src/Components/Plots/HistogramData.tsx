/*
* Interface for histogram data
*/
export interface Commit {
    fork: string;
    date: Date;
}

export interface CommitList {
    commits: Commit[];
}

import { Commit } from "@Types/LogicLayerTypes";
import { CollabGraphData } from "@VisInterfaces/CollabGraphData";
import { CommitTableData } from "@VisInterfaces/CommitTableData";
import { HistogramData } from "@VisInterfaces/HistogramData";
import { SankeyData } from "@VisInterfaces/SankeyData";
import { TimelineData } from "@VisInterfaces/TimelineData";
import { WordCloudData } from "@VisInterfaces/WordCloudData";

/* Map commit data to Histogram
Passes the following data:
- repo: The name of the repository
- date: The date of the commit in ISO format
*/
export const mapCommitDataToHistogram = (commitData: Commit[]): HistogramData => ({
    commitData: commitData.map((commit) => ({
        repo: commit.repo,
        date: commit.date,
    })),
});

/* Map commit data to Commit Timeline
Passes the following data:
- repo: The name of the repository
- id: The SHA of the commit
- parentIds: The SHA of the parent commits
- branch: The name of the branch
- date: The date of the commit in ISO format
- url: The URL of the commit 
*/
export const mapCommitDataToTimeline = (commitData: Commit[]): TimelineData => ({
    commitData: commitData.map((commit) => ({
        repo: commit.repo,
        id: commit.sha,
        parentIds: commit.parentIds,
        branch: commit.branch,
        date: commit.date.toISOString(),
        url: commit.url,
    })),
});

/* Map commit data to Commit Table
Passes the following data:
- id: The SHA of the commit
- repo: The name of the repository
- author: The author of the commit
- login: The login of the author
- date: The date of the commit in ISO format
- message: The message of the commit
*/
export const mapCommitDataToCommitTable = (commitData: Commit[]): CommitTableData => ({
    commitData: commitData.map((commit) => ({
        id: commit.sha,
        repo: commit.repo,
        author: commit.author,
        login: commit.login,
        date: commit.date.toISOString(),
        message: commit.message,
    })),
});

/* Map commit data to Word Cloud
Passes the following data:
- commitData: The message of the commit
*/
export const mapCommitDataToWordCloud = (commitData: Commit[]): WordCloudData => ({
    commitData: commitData.map((commit) => commit.message),
});

/* Map commit data to Sankey
Passes the following data:
- repo: The name of the repository
- commitType: The type of the commit (e.g., "merge", "push", etc.)
*/
export const mapCommitDataToSankey = (commitData: Commit[]): SankeyData => ({
    commitData: commitData.map((commit) => ({
        repo: commit.repo,
        commitType: commit.commitType,
    })),
});

/* Map commit data to Collaboration Graph
Passes the following data:
- author: The author of the commit
- login: The login of the author
- repo: The name of the repository
- date: The date of the commit in ISO format
*/
export const mapCommitDataToCollabGraph = (commitData: Commit[]): CollabGraphData => ({
    commitData: commitData.map((commit) => ({
        author: commit.author,
        login: commit.login,
        repo: commit.repo,
        date: commit.date.toISOString()
    })),
});


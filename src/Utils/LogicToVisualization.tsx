import { Commit } from "@Types/LogicLayerTypes";
import { CollabGraphData } from "@VisInterfaces/CollabGraphData";
import { CommitTableData } from "@VisInterfaces/CommitTableData";
import { HistogramData } from "@VisInterfaces/HistogramData";
import { SankeyData } from "@VisInterfaces/SankeyData";
import { TimelineData } from "@VisInterfaces/TimelineData";
import { WordCloudData } from "@VisInterfaces/WordCloudData";

// Helper function to map commit data
export const mapCommitDataToHistogram = (commitData: Commit[]): HistogramData => ({
    commitData: commitData.map((commit) => ({
        repo: commit.repo,
        date: commit.date,
    })),
});

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

export const mapCommitDataToWordCloud = (commitData: Commit[]): WordCloudData => ({
    commitData: commitData.map((commit) => commit.message),
});

export const mapCommitDataToSankey = (commitData: Commit[]): SankeyData => ({
    commitData: commitData.map((commit) => ({
        repo: commit.repo,
        commitType: commit.commitType,
    })),
});

export const mapCommitDataToCollabGraph = (commitData: Commit[]): CollabGraphData => ({
    commitData: commitData.map((commit) => ({
        author: commit.author,
        login: commit.login,
        repo: commit.repo,
        date: commit.date.toISOString()
    })),
});


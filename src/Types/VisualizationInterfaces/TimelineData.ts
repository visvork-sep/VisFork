/**
 * Interface of the data format used by the timeline per commit.
 */
export interface TimelineDetails {
  id: string;
  parentIds: string[];
  repo: string;
  branch:string;
  date: string;
  url: string;
}

/**
 * Interface of the data format used by the timeline.
 */
export interface TimelineData {
    commitData: TimelineDetails[];
}

export interface TimelineProps {
    commitData: TimelineDetails[];
    handleTimelineSelection: (commitIds: string[]) => void;
    c_width: number;
    c_height: number;
    merged: boolean;
    defaultBranches: Record<string, string>;
}

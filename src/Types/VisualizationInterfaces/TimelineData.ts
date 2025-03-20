/**
 * Interface of the data format used by the timeline per commit.
 */
interface TimelineDetails {
  id: string;
  parentIds: string[];
  repo: string;
  branch:string;
  date: Date;
  url: string;
}

/**
 * Interface of the data format used by the timeline.
 */
export interface TimelineData {
    commitData: TimelineDetails[]
}

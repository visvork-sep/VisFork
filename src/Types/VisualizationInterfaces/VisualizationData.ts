import { CollabGraphData } from "@VisInterfaces/CollabGraphData";
import { CommitTableData } from "@VisInterfaces/CommitTableData";
import { ForkListData } from "@VisInterfaces/ForkListData";
import { HistogramData } from "@VisInterfaces/HistogramData";
import { SankeyData } from "@VisInterfaces/SankeyData";
import { TimelineData } from "@VisInterfaces/TimelineData";
import { WordCloudData } from "@VisInterfaces/WordCloudData";

/**
 * Interface representing the aggregated visualization data.
 * Each property holds data specific to a particular visualization component.
 * Extendable by adding more visualization data types as needed.
 */
export interface VisualizationData {
    forkListData: ForkListData;
    histogramData: HistogramData;
    timelineData: TimelineData;
    commitTableData: CommitTableData;
    wordCloudData: WordCloudData;
    sankeyData: SankeyData;
    collabGraphData: CollabGraphData;
}

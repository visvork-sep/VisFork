// Define the filter state structure
/** See URD Section 3.1.3. "Filtering and Sorting Options". */
export interface ForkFilter {
    dateRange: DateRange;
    activeForksOnly?: boolean;
    forkType?: ForkType;
    ownerType?: OwnerType;
    updatedInLastMonths?: number;
}

export interface DateRange {
    start?: Date;
    end?: Date
};

export type ForkType = "adaptive" | "corrective" | "perfective";

export type OwnerType = "user" | "organization";

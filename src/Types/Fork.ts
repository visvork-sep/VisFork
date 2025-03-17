export interface  ForkInfo {
    id: number;
    name: string;
    owner: { login: string };
    description: string | null;
    created_at: string | null | undefined;
    last_pushed: string | null | undefined;
}

export interface DateRange {
    start?: string;
    end?: string
};

export interface ForkQueryState {
    owner: string;
    repo: string;
    range: DateRange
    sort?: "newest" | "oldest" | "stargazers" | "watchers";
}


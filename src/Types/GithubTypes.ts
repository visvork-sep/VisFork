import { paths, components } from "@generated/rest-schema";

export type CommitQueryParams = paths["/repos/{owner}/{repo}/commits"]["get"]["parameters"];
export type ForkQueryParams = paths["/repos/{owner}/{repo}/forks"]["get"]["parameters"];

export type Fork = components["schemas"]["minimal-repository"];
export type Commit = components["schemas"]["commit"];

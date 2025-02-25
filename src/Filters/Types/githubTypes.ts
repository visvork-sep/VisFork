import { paths, components } from "@generated/rest-schema";

export type CommitQueryParams = paths["/repos/{owner}/{repo}/commits"]["get"]["parameters"];
export type ForkQueryParams = paths["/repos/{owner}/{repo}/forks"]["get"]["parameters"];

export type ForkJSON = components["schemas"]["minimal-repository"];
export type CommitJSON = components["schemas"]["commit"];

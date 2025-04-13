import { describe, it, expect } from "vitest";
import { toForkInfo, toCommitInfo } from "./DataToLogic.ts";
import { GitHubAPIFork, GitHubAPICommit } from "@Types/DataLayerTypes";


describe("Data to logic tests", () => {

    it("Converts fork info correctly", () => {
        const sampleData = {
            id: 1,
            name: "name",
            owner: {
                login: "owner_login",
            },
            description: "fork_description",
        } as GitHubAPIFork;

        const processedData = toForkInfo(sampleData);
        expect(processedData.last_pushed === sampleData.pushed_at);
        expect(processedData.defaultBranch === "");
        expect(processedData.created_at === null);
    });

    it("Converts commit info correctly", () => {
        const sampleData = {
            sha: "",
            node_id: "",
            html_url: "url",
        } as GitHubAPICommit;
        let processedData = toCommitInfo(sampleData);

        expect(processedData.url === sampleData.html_url);
        expect(processedData.parentIds.length === 0);

        sampleData.parents = [{sha: "1", url:""}, {sha:"2", url: ""}];
        processedData = toCommitInfo(sampleData);

        expect(processedData.parentIds.includes("1"));

    });

});

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, it, expect } from "vitest";
import {
    createCommitQueryParams,
    createForkQueryParams,
    createForkQueryParamsGql
} from "./queryHelpers.ts";
import { FORKS_SORTING_ORDERS } from "./Constants";
import { OrderDirection, RepositoryOrderField } from "@generated/graphql";

describe("Query param builder tests", () => {
    it("Creates commit query params with defaults", () => {
        const params = createCommitQueryParams("owner1", "repo1", "2020-01-01", "2020-01-31");

        expect(params.path.owner).toBe("owner1");
        expect(params.path.repo).toBe("repo1");
        expect(params.query!.since).toBe("2020-01-01");
        expect(params.query!.until).toBe("2020-01-31");
        expect(params.query!.per_page).toBe(30);
    });

    it("Creates fork query params with defaults", () => {
        const sortValue = FORKS_SORTING_ORDERS.STARGAZERS.value;
        const params = createForkQueryParams("owner2", "repo2", sortValue);

        expect(params.path.owner).toBe("owner2");
        expect(params.path.repo).toBe("repo2");
        expect(params.query!.sort).toBe(sortValue);
        expect(params.query!.per_page).toBe(30);
        expect(params.query!.page).toBe(1);
    });

    it("Creates GraphQL fork query params with defaults", () => {
        const params = createForkQueryParamsGql("owner3", "repo3", 10);

        expect(params.owner).toBe("owner3");
        expect(params.name).toBe("repo3");
        expect(params.numForks).toBe(10);
        expect(params.repositoryOrder.direction).toBe(OrderDirection.Desc);
        expect(params.repositoryOrder.field).toBe(RepositoryOrderField.Stargazers);
        expect(params.after).toBeUndefined();
    });

    it("Accepts 'after' cursor in GraphQL params", () => {
        const params = createForkQueryParamsGql("owner4", "repo4", 5, undefined, "cursor123");

        expect(params.after).toBe("cursor123");
    });
});

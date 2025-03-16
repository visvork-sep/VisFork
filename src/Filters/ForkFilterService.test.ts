import { describe, expect, it, beforeEach } from "vitest";
import { ForkFilterService } from "./ForkFilterService";
import { ForkJSON } from "../Types/GithubTypes";
import { DateRange, ForkFilter } from "../Types/ForkFilter";

const ffs: ForkFilterService = new ForkFilterService();

// Warning: AI generated example
const example_fork: ForkJSON = {
    id: 1296269,
    node_id: "MDEwOlJlcG9zaXRvcnkxMjk2MjY5",
    name: "Hello-World",
    full_name: "octocat/Hello-World",
    owner: {
        login: "octocat",
        id: 1,
        node_id: "MDQ6VXNlcjE=",
        avatar_url: "https://github.com/images/error/octocat_happy.gif",
        gravatar_id: "",
        url: "https://api.github.com/users/octocat",
        html_url: "https://github.com/octocat",
        followers_url: "https://api.github.com/users/octocat/followers",
        following_url: "https://api.github.com/users/octocat/following{/other_user}",
        gists_url: "https://api.github.com/users/octocat/gists{/gist_id}",
        starred_url: "https://api.github.com/users/octocat/starred{/owner}{/repo}",
        subscriptions_url: "https://api.github.com/users/octocat/subscriptions",
        organizations_url: "https://api.github.com/users/octocat/orgs",
        repos_url: "https://api.github.com/users/octocat/repos",
        events_url: "https://api.github.com/users/octocat/events{/privacy}",
        received_events_url: "https://api.github.com/users/octocat/received_events",
        type: "User",
        site_admin: false
    },
    private: false,
    html_url: "https://github.com/octocat/Hello-World",
    description: "This is your first repo!",
    fork: false,
    url: "https://api.github.com/repos/octocat/Hello-World",
    archive_url: "http://api.github.com/repos/octocat/Hello-World/{archive_format}{/ref}",
    assignees_url: "http://api.github.com/repos/octocat/Hello-World/assignees{/user}",
    blobs_url: "http://api.github.com/repos/octocat/Hello-World/git/blobs{/sha}",
    branches_url: "http://api.github.com/repos/octocat/Hello-World/branches{/branch}",
    collaborators_url: "http://api.github.com/repos/octocat/Hello-World/collaborators{/collaborator}",
    comments_url: "http://api.github.com/repos/octocat/Hello-World/comments{/number}",
    commits_url: "http://api.github.com/repos/octocat/Hello-World/commits{/sha}",
    compare_url: "http://api.github.com/repos/octocat/Hello-World/compare/{base}...{head}",
    contents_url: "http://api.github.com/repos/octocat/Hello-World/contents/{+path}",
    contributors_url: "http://api.github.com/repos/octocat/Hello-World/contributors",
    deployments_url: "http://api.github.com/repos/octocat/Hello-World/deployments",
    downloads_url: "http://api.github.com/repos/octocat/Hello-World/downloads",
    events_url: "http://api.github.com/repos/octocat/Hello-World/events",
    forks_url: "http://api.github.com/repos/octocat/Hello-World/forks",
    git_commits_url: "http://api.github.com/repos/octocat/Hello-World/git/commits{/sha}",
    git_refs_url: "http://api.github.com/repos/octocat/Hello-World/git/refs{/sha}",
    git_tags_url: "http://api.github.com/repos/octocat/Hello-World/git/tags{/sha}",
    issue_comment_url: "http://api.github.com/repos/octocat/Hello-World/issues/comments{/number}",
    issue_events_url: "http://api.github.com/repos/octocat/Hello-World/issues/events{/number}",
    issues_url: "http://api.github.com/repos/octocat/Hello-World/issues{/number}",
    keys_url: "http://api.github.com/repos/octocat/Hello-World/keys{/key_id}",
    labels_url: "http://api.github.com/repos/octocat/Hello-World/labels{/name}",
    languages_url: "http://api.github.com/repos/octocat/Hello-World/languages",
    merges_url: "http://api.github.com/repos/octocat/Hello-World/merges",
    milestones_url: "http://api.github.com/repos/octocat/Hello-World/milestones{/number}",
    notifications_url: "http://api.github.com/repos/octocat/Hello-World/notifications{?since,all,participating}",
    pulls_url: "http://api.github.com/repos/octocat/Hello-World/pulls{/number}",
    releases_url: "http://api.github.com/repos/octocat/Hello-World/releases{/id}",
    stargazers_url: "http://api.github.com/repos/octocat/Hello-World/stargazers",
    statuses_url: "http://api.github.com/repos/octocat/Hello-World/statuses/{sha}",
    subscribers_url: "http://api.github.com/repos/octocat/Hello-World/subscribers",
    subscription_url: "http://api.github.com/repos/octocat/Hello-World/subscription",
    tags_url: "http://api.github.com/repos/octocat/Hello-World/tags",
    teams_url: "http://api.github.com/repos/octocat/Hello-World/teams",
    trees_url: "http://api.github.com/repos/octocat/Hello-World/git/trees{/sha}",
    hooks_url: "http://api.github.com/repos/octocat/Hello-World/hooks",
    forks_count: 10,
    stargazers_count: 150,
    watchers_count: 150,
    size: 1234,
    default_branch: "main",
    open_issues_count: 5,
    is_template: false,
    topics: ["github", "octocat", "example"],
    has_issues: true,
    has_projects: true,
    has_wiki: true,
    has_pages: false,
    has_downloads: true,
    has_discussions: false,
    archived: false,
    disabled: false,
    visibility: "public",
    pushed_at: "2020-03-15T19:06:43Z",
    created_at: "2011-01-26T19:01:12Z",
    updated_at: "2020-03-15T19:14:43Z",
    permissions: {
        admin: false,
        maintain: false,
        push: true,
        triage: false,
        pull: true
    },
    role_name: "admin",
    forks: 10,
    open_issues: 5,
    watchers: 150,
    allow_forking: true,
    web_commit_signoff_required: false
};

const example_filter: ForkFilter = {
    dateRange: {start: undefined, end: undefined },
    sortBy: "oldest"
}

let fork: any = null;
let filter: any = null;

describe("Errors", () => {
    describe("ForkFilterService#apply basic errors", () => {
        beforeEach(() => {
            fork = null;
            filter = null;
        });

        it("should throw an error when param fork is null", () => {
            fork = null;
            filter = example_filter;
            expect(() => ffs.apply(fork, filter)).toThrow(TypeError);
        });

        it("should throw an error when param fork is undefined", () => {
            fork = undefined;
            filter = example_filter;
            expect(() => ffs.apply(fork, filter)).toThrow(TypeError);
        });

        it("should throw an error when param filter is null", () => {
            fork = example_fork;
            filter = null;
            expect(() => ffs.apply(fork, filter)).toThrow(TypeError);
        });

        it("should throw an error when param filter is undefined", () => {
            fork = example_fork;
            filter = undefined;
            expect(() => ffs.apply(fork, filter)).toThrow(TypeError);
        });
    });

    /** Each group within tests errors that a private method used by
     *  {@link ForkFilterService#apply} might throw (wherever applicable).
     */
    describe("ForkFilterService#apply nested errors", () => {
        beforeEach(() => {
            fork = example_fork;
            filter = example_filter;
        });

        describe("isForkInDateRange errors", () => {
            it("should throw an error when fork.created_at is undefined ", () => {
                fork.created_at = undefined;
                expect(() => ffs.apply(fork, filter)).toThrow(TypeError);
            });

            it("should throw an error when fork.created_at is null ", () => {
                fork.created_at = null;
                expect(() => ffs.apply(fork, filter)).toThrow(TypeError);
            });

            it("should throw an error when both dateRange.start and dateRange.end are undefined", () => {
                filter.dateRange.start = undefined;
                filter.dateRange.end = undefined;
                expect(() => ffs.apply(fork, filter)).toThrow(TypeError);
            });
        });
    });
});

describe("Regular functionality", () => {
    beforeEach(() => {
        fork = structuredClone(example_fork); // makes sure it completely wipes any changes made during individual tests before each new test
        fork.created_at = "2011-01-26T19:01:12Z";
        filter = structuredClone(example_filter);
        // the base is that we include all forks based on date:
        filter.dateRange.start = "1970-01-01T19:01:12Z";
    });

    describe("Date range", () => {
        it("should return null - only start date", () => {
            // a date most likely way after the creation of any fork
            filter.dateRange.start = "9999-01-01T19:01:12Z";
            filter.dateRange.end = undefined;
            expect(ffs.apply(fork, filter)).toBe(null);
        });

        it("should return the same fork - only start date", () => {
            // a date definitely way before the creation of any fork
            // warning: don't set it to be lower than 1970.01.01
            filter.dateRange.start = "1970-01-01T19:01:12Z";
            filter.dateRange.end = undefined;
            expect(ffs.apply(fork, filter)).toBe(fork);
        });
    
        it("should return null - only end date", () => {
            // a date most likely way before the creation of any fork
            // warning: don't set it to be lower than 1970.01.01
            filter.dateRange.start = undefined;
            filter.dateRange.end = "1970-01-01T19:01:12Z";
            expect(ffs.apply(fork, filter)).toBe(null);
        });

        it("should return the same fork - only end date", () => {
            // a date most likely way after the creation of any fork
            filter.dateRange.start = undefined;
            filter.dateRange.end = "9999-01-01T19:01:12Z";
            expect(ffs.apply(fork, filter)).toBe(fork);
        });
    
        it("should return null - both dates", () => {
            filter.dateRange.start = "9777-01-01T19:01:12Z";
            filter.dateRange.end = "9999-01-01T19:01:12Z";
            expect(ffs.apply(fork, filter)).toBe(null);
        });

        it("should return the same fork - both dates", () => {
            filter.dateRange.start = "1970-01-01T19:01:12Z";
            filter.dateRange.end = "9999-01-01T19:01:12Z";
            expect(ffs.apply(fork, filter)).toBe(fork);
        });
    });

    describe("Fork activity", () => {
        it("should return the same fork - undefined activeForksOnly param even though fork is inactive", () => {
            filter.activeForksOnly = undefined;
            expect(ffs.apply(fork, filter)).toBe(fork);
        });

        it("should return the same fork - null activeForksOnly param even though fork is inactive", () => {
            filter.activeForksOnly = null;
            expect(ffs.apply(fork, filter)).toBe(fork);
        });
    
        it("should return the same fork - activeForksOnly param set to true and fork is active", () => {
            fork.updated_at = new Date().toISOString();
            filter.activeForksOnly = true;
            expect(ffs.apply(fork, filter)).toBe(fork);
        });

        it("should return null - activeForksOnly param set to true and fork is inactive", () => {
            filter.activeForksOnly = true;
            expect(ffs.apply(fork, filter)).toBe(null);
        });

        it("should return the same fork - activeForksOnly param set to false even though fork is inactive", () => {
            filter.activeForksOnly = false;
            expect(ffs.apply(fork, filter)).toBe(fork);
        });
    });

    // describe("Fork type", () => {
    //     /* TODO */
    // });

    describe("Owner type", () => {
        it("should return the same fork - ownerType is undefined", () => {
            filter.ownerType = undefined;
            expect(ffs.apply(fork, filter)).toBe(fork);
        });

        it("should return the same fork - ownerType is null", () => {
            filter.ownerType = null;
            expect(ffs.apply(fork, filter)).toBe(fork);
        });

        it("should return the same fork - ownerType matches (case insensitive)", () => {
            filter.ownerType = "user";
            fork.owner.type = "User";
            expect(ffs.apply(fork, filter)).toBe(fork);
        });

        it("should return the same fork - ownerType matches (case insensitive)", () => {
            filter.ownerType = "organization";
            fork.owner.type = "oRgAnIzATiOn";
            expect(ffs.apply(fork, filter)).toBe(fork);
        });

        it("should return null - ownerType does not match", () => {
            filter.ownerType = "user";
            fork.owner.type = "organization";
            expect(ffs.apply(fork, filter)).toBe(null);
        });
    });

    describe("Updated in last n months", () => {
        it("should return the same fork - nrOfMonths is undefined", () => {
            filter.updatedInLastMonths = undefined;
            expect(ffs.apply(fork, filter)).toBe(fork);
        });

        it("should return the same fork - nrOfMonths is null", () => {
            filter.updatedInLastMonths = null;
            expect(ffs.apply(fork, filter)).toBe(fork);
        });

        it("should return null - fork last update was NOT within last n months", () => {
            filter.updatedInLastMonths = 1; // 20 years
            expect(ffs.apply(fork, filter)).toBe(null);
        });

        it("should return the same fork - fork last update was within last n months", () => {
            filter.updatedInLastMonths = 240; // 20 years
            expect(ffs.apply(fork, filter)).toBe(fork);
        });
    });
});

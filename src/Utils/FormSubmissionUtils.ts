import { SortDirection, ForksSortingOrder, OwnerType } from "@Utils/Constants";
import { SortingCriterionExtra, ForkFilter } from "../Types/ForkFilter";
import { Dispatch, SetStateAction } from "react";
import { InputError, UnknownError } from "../Types/FormErrors";
import { preparedFormComplete } from "@Types/FilterForm";

function setInputError(e: unknown, setter: Dispatch<SetStateAction<InputError | null>>) {
    if (e instanceof InputError) {
        setter(e);
    } else {
        setter(new UnknownError());
    }
}

/**
 * Waiting for extension on the filter
 * 
 * @param input SortDirection as defined in constants.
 * @returns mapped value for logic layer
 */
function mapForksSortDirection(input: SortDirection): unknown {
    switch (input) {
        case "asc":
            return "ascending";
        case "desc":
            return "descending";
    }
}

function mapForksSortCriterion(input: ForksSortingOrder): SortingCriterionExtra {
    switch (input) {
        case "authorStars":
            return "authorPopularity";
        case "date":
            return "newest";
        case "lastCommit":
            return "latestCommit";
        case "stargazers":
            return "stargazers";
        case "watchers":
            return "watchers";
    }
}

/**
 * Waiting for extension on the filter
 * 
 * @param input OwnerType as defined in constants.
 * @returns mapped value for logic layer
 */
function mapForksOwnerType(input: OwnerType[]): unknown {
    return input;
}

function filterFactory(form: preparedFormComplete): ForkFilter {
    const filter: ForkFilter = {
        dateRange: {
            start: form.commitsDateRangeFrom.toISOString(),
            end: form.commitsDateRangeUntil.toISOString()
        },
        sortBy: mapForksSortCriterion(form.forksOrder),
        ownerType: undefined,
        activeForksOnly: undefined,
        forkType: undefined,
        updatedInLastMonths: form.recentlyUpdated ?? undefined
    };

    return filter;
}

export {
    setInputError,
    mapForksSortDirection,
    mapForksSortCriterion,
    mapForksOwnerType,
    filterFactory
};

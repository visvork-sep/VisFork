import { Dispatch, SetStateAction } from "react";
import { InputError, UnknownError } from "../Types/UIFormErrors";
import { preparedFormComplete } from "@Types/UIFormTypes";
import { ForkQueryState, ForkFilter } from "@Types/LogicLayerTypes";

/**
 * Handles setting the input error using a provided setter.
 */
function setInputError(e: unknown, setter: Dispatch<SetStateAction<InputError | null>>) {
    if (e instanceof InputError) {
        setter(e);
    } else {
        setter(new UnknownError());
    }
}

/**
 * Wraps the execution of a prepare function in a try-catch block.
 * If an error occurs during execution, it sets the error using the provided setter.
 */
function safePrepare<T, U>(
    prepareFunction: (input: T) => U,
    input: T,
    errorSetter: Dispatch<SetStateAction<InputError | null>>
) {
    try {
        const output = prepareFunction(input);
        errorSetter(null);
        return output;
    } catch (e) {
        setInputError(e, errorSetter);
        return null;
    }
}

/**
 * Creates a ForkFilter object based on the provided form data.
 * Contains the owner types, commit types, and the number of months since the last update.
 */
function filterFactory(form: preparedFormComplete): ForkFilter {
    const filter: ForkFilter = {
        ownerTypes: form.ownerTypeFilter,
        commitTypes: form.commitsTypeFilter,
        updatedInLastMonths: form.recentlyUpdated ?? undefined
    };

    return filter;
}

/**
 * Creates a ForkQueryState object based on the provided form data.
 * Contains the owner, repository name, forks count, date range, sort order, and sort direction.
 */
function forkQueryStateFactory(form: preparedFormComplete): ForkQueryState {
    const forkQueryState: ForkQueryState = {
        owner: form.owner,
        repo: form.repositoryName,
        forksCount: form.forksCount,
        range: {
            start: form.commitsDateRangeFrom,
            end: form.commitsDateRangeUntil
        },
        sort: form.forksOrder,
        direction: form.forksSortDirection
    };

    return forkQueryState;
}

export {
    filterFactory,
    forkQueryStateFactory,
    safePrepare,
    setInputError
};

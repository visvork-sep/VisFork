import { Dispatch, SetStateAction } from "react";
import { InputError, UnknownError } from "../Types/FormErrors";
import { preparedFormComplete } from "@Types/FilterForm";
import { ForkQueryState, ForkFilter } from "@Types/LogicLayerTypes";

function setInputError(e: unknown, setter: Dispatch<SetStateAction<InputError | null>>) {
    if (e instanceof InputError) {
        setter(e);
    } else {
        setter(new UnknownError());
    }
}

function filterFactory(form: preparedFormComplete): ForkFilter {
    const filter: ForkFilter = {
        dateRange: {
            start: form.commitsDateRangeFrom,
            end: form.commitsDateRangeUntil
        },
        ownerTypes: form.ownerTypeFilter,
        activeForksOnly: false,
        forkTypes: form.forksTypeFilter,
        updatedInLastMonths: form.recentlyUpdated ?? undefined
    };

    return filter;
}

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
    setInputError,
    filterFactory,
    forkQueryStateFactory
};

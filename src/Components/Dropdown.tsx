import { Details } from "@primer/react";
import { PropsWithChildren } from "react";

interface DropdownProps {
    summaryText: string;
}

function Dropdown({ children, summaryText }: PropsWithChildren<DropdownProps>) {
    return (
        <Details sx={{
            "> summary::-webkit-details-marker": {
                display: "revert"
            },
            "> summary": {
                backgroundColor: "neutral.muted",
                padding: "5px"
            }
        }}>
            <Details.Summary>{summaryText}</Details.Summary>
            {children}
        </Details>
    );
}

export {
    Dropdown
};
export type { DropdownProps };

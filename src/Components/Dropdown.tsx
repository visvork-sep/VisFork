import { Details } from "@primer/react";
import { PropsWithChildren } from "react";
import styles from "./Dropdown.module.scss";

interface DropdownProps {
    summaryText: string;
}

function Dropdown({ children, summaryText }: PropsWithChildren<DropdownProps>) {
    return (
        <Details className={styles.details}>
            <Details.Summary>{summaryText}</Details.Summary>
            {children}
        </Details>
    );
}

export {
    Dropdown
};
export type { DropdownProps };

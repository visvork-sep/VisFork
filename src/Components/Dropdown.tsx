import { Box, Details } from "@primer/react";
import { PropsWithChildren } from "react";
import styles from "./Dropdown.module.scss";

interface DropdownProps {
    summaryText: string;
}

function Dropdown({ children, summaryText }: PropsWithChildren<DropdownProps>) {
    return (
        <Details className={styles.details}>
            <Details.Summary>{summaryText}</Details.Summary>
            <Box
                sx={{
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: "border.default",
                    height: "100%",
                    borderRadius: 2,
                    p: 3,
                }}
            >
                {children}
            </Box>
        </Details>
    );
}

export {
    Dropdown
};
export type { DropdownProps };

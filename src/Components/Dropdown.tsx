import { Box, Details } from "@primer/react";
import { PropsWithChildren, ReactNode } from "react";
import styles from "./Dropdown.module.scss";

interface DropdownProps {
  summaryText: string; // Title of the dropdown boxes
  infoButton?: ReactNode; // Allow an optional info button
}

function Dropdown({ children, summaryText, infoButton }: PropsWithChildren<DropdownProps>) {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
        <Details className={styles.details} sx={{ flexGrow: 1 }}>
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
        {infoButton && (
            <Box >
            {infoButton}
            </Box>
        )}
    </Box>
    );
}

export { Dropdown };
export type { DropdownProps };

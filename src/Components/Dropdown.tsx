import { Box, Details, Stack } from "@primer/react";
import { PropsWithChildren, ReactNode } from "react";
import styles from "./Dropdown.module.scss";

interface DropdownProps {
  summaryText: string; // Title of the dropdown boxes
  infoButton?: ReactNode; // Allow an optional info button
}

function Dropdown({ children, summaryText, infoButton }: PropsWithChildren<DropdownProps>) {
    return (
        <Stack direction="horizontal" gap="condensed">
            <Stack.Item grow>
                <Details className={styles.details}>
                    <Details.Summary>{summaryText}</Details.Summary>
                    <Box className={styles.content}>
                        {children}
                    </Box>
                </Details>
            </Stack.Item>
            {infoButton && (
                <Stack.Item>
                    {infoButton}
                </Stack.Item>
            )}
        </Stack>
    );
}

export { Dropdown };
export type { DropdownProps };
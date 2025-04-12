import { Box, Details, Stack, useDetails } from "@primer/react";
import { PropsWithChildren, ReactNode } from "react";
import styles from "./Dropdown.module.scss";

/**
 * Interface for the Dropdown component props.
 */
interface DropdownProps {
    summaryText: string; // Title of the dropdown boxes
    infoButton?: ReactNode; // Allow an optional info button
    open?: boolean; // Allow the dropdown to be open by default
}

/**
 * Component that displays a dropdown with a summary text and optional info button.
 */
function Dropdown({ children, summaryText, infoButton, open = false }: PropsWithChildren<DropdownProps>) {

    const { getDetailsProps } = useDetails({ defaultOpen: open });

    return (
        <Stack direction="horizontal" gap="condensed">
            <Stack.Item grow>
                <Details {...getDetailsProps()} className={styles.details}>
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

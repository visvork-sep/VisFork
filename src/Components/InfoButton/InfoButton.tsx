import { InfoIcon } from "@primer/octicons-react";
import { Dialog, Button } from "@primer/react";
import { useState } from "react";
import Tooltip from "@Components/Tooltip/Tooltip";

/**
 * Interface for the InfoButton component props.
 */
interface InfoButtonProps {
    title: string; //Name of the visualization
    shortDescription: string; //Quick hover over description
    fullDescription: string; // Extended description for clicking
}

/**
 * Component that displays an info button with a tooltip and a dialog for more information.
 * The tooltip shows a short description, and the dialog shows a full description when clicked.
 */
export function InfoButton({ title, shortDescription, fullDescription }: InfoButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Tooltip text={shortDescription}>
                <Button
                    variant="invisible"
                    onClick={() => setIsOpen(true)}
                    aria-label={`More info about ${title}`}
                >
                    <InfoIcon size={16} />
                </Button>
            </Tooltip>

            {isOpen && (
                <Dialog title={title} onClose={() => setIsOpen(false)}>
                    <Dialog.Body>
                        {fullDescription.split("\n").map((line, index) => (
                            <p key={index}>{line}</p>
                        ))}
                    </Dialog.Body>
                </Dialog>
            )}
        </>
    );
}

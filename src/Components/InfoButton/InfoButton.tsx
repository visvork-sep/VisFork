import { InfoIcon } from "@primer/octicons-react";
import { Dialog, Button } from "@primer/react";
import { useState } from "react";
import Tooltip from "@Components/Tooltip/Tooltip";
interface InfoButtonProps {
    title: string; //Name of the visualization
    shortDescription: string; //Quick hover over description
    fullDescription: string; // Extended description for clicking
}
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
                    <div>
                        {fullDescription.split("\n").map((line, index) => (
                            <p key={index}>{line}</p>
                        ))}
                    </div>
                </Dialog>
            )}
        </>
    );
}

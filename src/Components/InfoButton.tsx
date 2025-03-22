import { InfoIcon } from "@primer/octicons-react";
import { Tooltip, Dialog, Button } from "@primer/react";
import { useState } from "react";

interface InfoButtonProps {
  title: string; //Name of the visualization
  hoverDescription: string; //Quick hover over description
  description: string; // Extended description for clicking
}

export function InfoButton({ title, hoverDescription, description }: InfoButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Tooltip text={hoverDescription}>
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
          <p>{description}</p>
        </Dialog>
      )}
    </>
  );
}

import { InfoIcon } from "@primer/octicons-react";
import { Tooltip, Dialog, Button } from "@primer/react";
import { useState } from "react";

interface InfoButtonProps {
  title: string;
  description: string;
}

export function InfoButton({ title, description }: InfoButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Tooltip text="Info">
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

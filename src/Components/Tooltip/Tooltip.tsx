import React from "react";
import styles from "./Tooltip.module.scss"; // Import the CSS file for styling

// defines the props for the Tooltip component
interface TooltipProps {
    text: string;
    children: React.ReactNode;
}

// Component that displays a tooltip with the provided text when hovered over the children element
const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
    return (
        <span className={styles.tooltip}>
            {children}
            <span className={styles.tooltiptext}>{text}</span>
        </span>
    );
};

export default Tooltip;

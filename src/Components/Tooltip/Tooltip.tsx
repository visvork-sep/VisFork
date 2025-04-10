import React from "react";
import styles from "./Tooltip.module.scss"; // Import the CSS file for styling
interface TooltipProps {
    text: string;
    children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
    return (
        <span className={styles.tooltip}>
            {children}
            <span className={styles.tooltiptext}>{text}</span>
        </span>
    );
};

export default Tooltip;

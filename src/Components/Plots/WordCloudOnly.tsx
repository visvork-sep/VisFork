import React from "react";
import WordCloud from "./WordCloud";

const WordCloudOnly: React.FC = () => {
    return (
        <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <WordCloud/>
        </div>
    );
};

export default WordCloudOnly;
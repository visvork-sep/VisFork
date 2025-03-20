import React from "react";
import WordCloud from "./WordCloud/WordCloud";
const WordCloudBox: React.FC = () => {
    return (
        <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
            <h2 style={{ textAlign: "center" }}>Word Cloud</h2>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <WordCloud />
            </div>
        </div>
    );
};

export default WordCloudBox;

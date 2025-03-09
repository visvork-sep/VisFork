import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import cloud from "d3-cloud";
import { stemmer } from "stemmer";
import { lemmatizer } from "lemmatizer";
import {removeStopwords} from "stopword";

interface Word {
    text: string;
    size: number;
    rotate?: number;
    x?: number;
    y?: number;
}

// Simple tokenizer function
const tokenize = (text: string) => {
    return text.split(/\W+/).filter((token) => token.length > 1);
};

// Define the processing functions
const stemmingFunction = (token: string) => stemmer(token);
const lemmatizationFunction = (token: string) => lemmatizer(token);


const processCommitMessages = (data: any, processToken: (token: string) => string, start: number, finish: number) => {
    const wordFreq: {[key: string]: number} = {};

    data.forEach((commit: any) => {
        console.log("Original Message:", commit.message);

        const tokens = tokenize(commit.message);
        console.log("Tokens:", tokens);

        const filteredTokens = removeStopwords(tokens).filter(token => isNaN(Number(token)));
        console.log("Filtered Tokens:", filteredTokens);
        
        filteredTokens.forEach((token: string) => {
            let processedWord
            try {
                processedWord = processToken(token.toLowerCase());
                if (typeof processedWord !== 'string') {
                    throw new Error('Invalid processed word');
                }
            } catch (error) {
                console.error(`Error processing token "${token}":`, error);
                processedWord = token.toLowerCase(); // Fallback to the original token
            }
            console.log("Processed Word:", processedWord);

            if (wordFreq[processedWord]) {
                wordFreq[processedWord]++;
            } else {
                wordFreq[processedWord] = 1;
            }
        });
    });

    // Object.keys(wordFreq).map((word) => ({
    //     text: word,
    //     freq: wordFreq[word],
    //     size: wordFreq[word] * 10, // Adjust size as needed
    // }))

    // Sort the words by frequency
    const sortedWords = Object.keys(wordFreq)
    .map((word) => ({
        text: word,
        freq: wordFreq[word],
        size: wordFreq[word] * 10, // Adjust size as needed
    })).sort((a, b) => b.freq - a.freq).slice(start, finish)

    // console.log("Word Frequency:", sortedWords);
    console.log("Sorted Words:", JSON.stringify(sortedWords, null, 2));
    return sortedWords;
}

// Test with a specific commit message
const testCommitData = [
    {
        message: "Downgrade to ffmpeg 4 for Intel build\n\nfix: iina-plus/iina#25 iina-plus/iina#52"
    }
    // {
    //     message: "fix, failure, constructor constructor constructor constructor constructdfs"
    // }
];

// Choose the processing function (either stemming or lemmatization)
const start = 0;
const finish = 8;
const processingFunction = lemmatizationFunction;
const words = processCommitMessages(testCommitData, processingFunction, start, finish);

const WordCloud: React.FC = () => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current) return;

        const layout = cloud<Word>()
            .size([500, 500])
            .words(words)
            .padding(5)
            .rotate(() => (~~(Math.random() * 2) * 90))
            .font("Impact")
            .fontSize((d) => d.size)
            .on("end", draw);

        layout.start();

        function draw(words: Word[]) {
            const svg = d3.select(svgRef.current);

            // Clear previous word cloud
            svg.selectAll("*").remove();

            const g = svg
                .attr("width", layout.size()[0])
                .attr("height", layout.size()[1])
                .append("g")
                .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")");

            const tooltip = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("position", "absolute")
                .style("background", "#f4f4f4")
                .style("padding", "8px")
                .style("border", "1px solid #ccc")
                .style("border-radius", "4px")
                .style("pointer-events", "none")
                .style("opacity", 0)
                .style("font", "var(--text-body-shorthand-medium)");

            g.selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", (d) => d.size + "px")
                .style("font-family", "Impact")
                .style("fill", (d, i) => d3.schemeCategory10[i % 10])
                .attr("text-anchor", "middle")
                .attr("transform", (d) => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")")
                .text((d) => d.text)
                .on("mouseover", (event, d) => {
                    tooltip.transition().duration(200).style("opacity", 0.9);
                    tooltip.html(
                        `<strong>Word</strong>: ${d.text}<br>
                        <strong>Frequency</strong>: ${d.size}`
                    )
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY) + "px");
                })
                .on("mousemove", (event) => {
                    tooltip.style("left", (event.pageX) + "px")
                        .style("top", (event.pageY) + "px");
                })
                .on("mouseout", () => {
                    tooltip.transition().duration(500).style("opacity", 0);
                });

            return () => {
                tooltip.remove();
            };
        }
    }, []);

    return <svg ref={svgRef}></svg>;
};

export default WordCloud;
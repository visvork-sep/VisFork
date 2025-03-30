import { useRef, useEffect, useState } from "react";
import { schemeCategory10, select, } from "d3";
import cloud from "d3-cloud";
import { Word, processCommitMessages, lemmatizationFunction } from "./utils";
import { createTooltip } from "./Tooltip";
import { WordCloudData } from "@VisInterfaces/WordCloudData";


const WordCloud = ({ commitData }: WordCloudData) => {

    const svgRef = useRef<SVGSVGElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [words, setWords] = useState<Word[]>([]);

    useEffect(() => {
        const handleResize = () => {
            if (svgRef.current) {
                let { clientWidth, clientHeight } = svgRef.current;

                // Set a maximum size to prevent it from being too lengthy
                const maxWidth = 800;
                const maxHeight = 600;

                // Maintain aspect ratio
                if (clientWidth / clientHeight > maxWidth / maxHeight) {
                    clientWidth = maxWidth;
                    clientHeight = (maxWidth / clientWidth) * clientHeight;
                } else {
                    clientHeight = maxHeight;
                    clientWidth = (maxHeight / clientHeight) * clientWidth;
                }

                setDimensions({ width: clientWidth, height: clientHeight });
            }
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => window.removeEventListener("resize", handleResize);
    }, []);
    useEffect(() => {
        const newWords = processCommitMessages(commitData, lemmatizationFunction, 0, 20);
        setWords(newWords);
    }, [commitData]);

    useEffect(() => {
        if (!svgRef.current) return;

        const layout = cloud<Word>()
            .size([dimensions.width, dimensions.height])
            .words(words)
            .padding(5)
            .rotate(() => (~~(Math.random() * 2) * 90))
            .font("Impact")
            .fontSize((d) => Math.sqrt(d.size) * 10)
            .on("end", draw);

        layout.start();

        function draw(words: Word[]) {
            const svg = select(svgRef.current);

            // Clear previous word cloud
            svg.selectAll("*").remove();

            const g = svg
                .attr("width", layout.size()[0])
                .attr("height", layout.size()[1])
                .append("g")
                .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")");

            const tooltip = createTooltip();

            g.selectAll("text")
                .data(words)
                .enter().append("text")
                .style("font-size", (d) => d.size + "px")
                .style("font-family", "Impact")
                .style("fill", (_, i) => schemeCategory10[i % 10])
                .attr("text-anchor", "middle")
                .attr("transform", (d) => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")")
                .text((d) => d.text)
                .on("mouseover", (event, d) => {
                    tooltip.transition().duration(200).style("opacity", 0.9);
                    tooltip.html(
                        `<strong>Word</strong>: ${d.text}<br>
                        <strong>Frequency</strong>: ${d.frequency}`
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
    }, [words, dimensions]);

    return <svg ref={svgRef} style={{ width: "100%", height: "100%" }}></svg>;
};

export default WordCloud;

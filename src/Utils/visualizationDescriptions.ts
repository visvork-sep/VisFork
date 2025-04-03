/**
 * Descriptions used in ApplicationBody.tsx for 
 * the info button hover and click actions
 */
export const visualizationDescriptions = {
    histogram: {
        short: "Shows commit activity over time with a zoomable Focus Chart.",
        full: "View the number of commits made across selected forks over a time period. " +
            "The Context Chart is the lower, smaller chart out of the two. Inside the Context Chart," + 
            "there is a selection window on the left, set to 20% by default. You can edit it by dragging " +
            "over the Context Chart. The Focus Chart (upper, larger chart) zooms in on the selected range for"+
            "detailed inspection. Hover over bars to see exact commit counts."
    },
    forkList: {
        short: "Lists repository forks with filtering and pagination.",
        full: "Browse a list of forks of the repository and their descriptions on multiple pages. " +
        "You can also select the number of rows per page on the right."
    },
    commitTimeline: {
        short: "Chronological view of commits with branching and merging.",
        full: "Explore the sequence of commits across multiple forks: \n" +
        "• Switch between Full View (detailed commit history) and Merged View (only deviations).\n" +
        "• Hover over a node to see extensive information about the respective commit.\n" +
        "• Click on a node to open its page on GitHub. \n" +
        "• Brush (click and drag) over the graph to create a selection window." +
        " Subsequent visualizations will only use the commits within the selection. \n" +
        "• Click on the color marker in the legend to select only commits from the corresponding repository." +
       " In Merged View, click on the shape marker in the legend to select only commits from the corresponding type."
    },
    commitTable: {
        short: "A searchable table of commits with key details.",
        full: "View commit details for a selected range in the timeline. " +
              "Each row includes the repository name, author, commit date, message, and a shortened version of " +
              "the commit hash. Use the search bar to filter commits based on the commit messages. The "+
              "repository name, author name and commit hash are all clickable links to the corresponding GitHub pages."
    },
    wordCloud: {
        short: "Highlights frequent words in commit messages.",
        full: "See the most commonly used words in commit messages. " +
              "Word size represents frequency. " +
              "The system preprocesses text by removing stopwords and applying lemmatization or stemming. " +
              "Updates dynamically based on selected commits from the Timeline."
    },
    sankeyDiagram: {
        short: "Shows commit classification by type.",
        full: "Visualize commit types (adaptive, corrective, perfective, or unknown). " +
              "Forks are on the left, commit categories on the right. " +
              "Link thickness reflects commit volume. " +
              "Hover over links for details on commit distribution."
    },
    collaborationGraph: {
        short: "Visualizes contributor interactions and commit activity.",
        full: "See how contributors and repositories are connected. " +
              "Nodes represent contributors (circles) and repositories (squares), with size based on activity. " +
              "Use the time slider (on the top) to animate commit activity by pressing play or clicking on the slider."
    }
};

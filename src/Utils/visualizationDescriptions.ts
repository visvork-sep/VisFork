/**
 * Descriptions used in ApplicationBody.tsx for 
 * the info button hover and click actions
 */
export const visualizationDescriptions = {
    histogram: {
        short: "Shows commit activity over time with a zoomable focus chart.",
        full: "View the number of commits made across selected forks over a time period. Use the Context Chart to see the full timeline and create a selection window. The Focus Chart zooms in on the selected range for detailed inspection. Hover over bars to see exact commit counts and trends over time."
    },
    forkList: {
        short: "Lists repository forks with filtering and pagination.",
        full: "Browse a paginated list of forks in the repository. Filter forks based on activity status and metadata to identify active vs. stale forks."
    },
    commitTimeline: {
        short: "Chronological view of commits with branching and merging.",
        full: "Explore the sequence of commits across multiple forks. Switch between Full View (detailed commit history) and Merged View (condensed view). Hover for tooltips, click commits to open them on GitHub, and use brushing to filter selections."
    },
    commitTable: {
        short: "A searchable table of commits with key details.",
        full: "View commit details for a selected range. Each row includes the repository name, author, commit date, message, and a link to GitHub. Use the search bar to filter commits."
    },
    wordCloud: {
        short: "Highlights frequent words in commit messages.",
        full: "See the most commonly used words in commit messages. Word size represents frequency. The system preprocesses text by removing stopwords and applying lemmatization or stemming. Updates dynamically based on selected commits."
    },
    sankeyDiagram: {
        short: "Shows commit classification by type.",
        full: "Visualize commit types (adaptive, corrective, perfective, or unknown). Forks are on the left, commit categories on the right. Link thickness reflects commit volume. Hover over links for details on commit distribution."
    },
    collaborationGraph: {
        short: "Visualizes contributor interactions and commit activity.",
        full: "See how contributors and repositories are connected. Nodes represent contributors (circles) and repositories (squares), with size based on activity. Use the time slider to animate commit activity."
    }
};

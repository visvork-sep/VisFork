export const visualizationDescriptions = {
    histogram: {
        short: "Shows commit activity over time with a zoomable focus chart.",
        full: "This visualization provides an overview of the number of commits made across selected forks over a specified time period. It consists of two parts: the Context Chart, which shows the entire timeline and allows users to create a selection window, and the Focus Chart, which zooms in on the selected range for detailed inspection. Users can hover over bars in the Focus Chart to view exact commit counts and trends over time."
    },
    forkList: {
        short: "Lists repository forks with filtering and pagination.",
        full: "Displays a paginated list of forks in the repository, allowing users to explore and navigate through different forks efficiently. Users can filter forks based on activity status and other metadata, helping them identify active versus stale forks in the ecosystem."
    },
    commitTimeline: {
        short: "Chronological view of commits with branching and merging.",
        full: "This visualization illustrates the chronological sequence of commits across multiple forks, highlighting branching and merging events. It offers two levels of granularity: the Full View, which displays each commit as an individual node, and the Merged View, which condenses consecutive commits into single nodes for better readability. Users can interact with the timeline through tooltips, click actions to open commits on GitHub, and brushing to filter the selection."
    },
    commitTable: {
        short: "A searchable table of commits with key details.",
        full: "A structured table that presents detailed commit information for the selected range. Each row represents a commit and includes details such as the repository name, author, commit date, message, and a direct link to the commit on GitHub. Users can filter the table using a search bar to find specific commits."
    },
    wordCloud: {
        short: "Highlights frequent words in commit messages.",
        full: "Generates a word cloud from the most frequently used words in commit messages. The word size represents frequency, allowing users to identify recurring themes. Words undergo preprocessing, including tokenization, stopword removal, and optional lemmatization or stemming to improve readability. The system dynamically updates the visualization based on the selected commits."
    },
    sankeyDiagram: {
        short: "Shows commit classification by type.",
        full: "Represents the classification of commits based on their type (adaptive, corrective, perfective, or unknown). The left-side nodes correspond to forks, while the right-side nodes represent commit categories. Links between nodes indicate the number of commits in each category, with link thickness reflecting commit volume. Users can hover over links to see additional details about commit distribution."
    },
    collaborationGraph: {
        short: "Visualizes contributor interactions and commit activity.",
        full: "A force-directed graph illustrating the interactions between contributors and repositories. Nodes represent contributors and repositories, with edges representing commit relationships. The size of the nodes reflects their level of contribution, and a time slider allows users to animate commit activity over time."
    }
};

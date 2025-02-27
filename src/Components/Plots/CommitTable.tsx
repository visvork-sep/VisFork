import {Column, DataTable, Table} from "@primer/react/experimental";
import { Box, Link, TextInput, useTheme } from "@primer/react";
import commitData from "./commit_data_example.json";
import { useState } from "react";

interface CommitInfo {
  repo: string;
  sha: string;
  id: string;
  parentIds: string[];
  branch_name: string;
  branch_id: string;
  node_id: string;
  author: string;
  date: string;
  url: string;
  message: string;
  commit_type: string;
  mergedNodes: unknown[];
}

function CommitTable() {

    // Fetch current color mode (light or dark)
    const {colorMode} = useTheme();

    // To track text input for filtering
    const [searchTerm, setSearchTerm] = useState("");

    // Load commit data from JSON file
    const data: CommitInfo[] = commitData;

    // Filter data based on current search term
    const filteredData = data.filter((commit) =>
        commit.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Determine hyperlink color based on color mode
    const isDarkMode = colorMode === "dark" || colorMode === "night";
    const linkColor = isDarkMode ? "white" : "black";

    // Define how each column will be displayed
    const columns: Column<CommitInfo>[] = [
        {
            header: "Owner/Repo",
            field: "repo",
            rowHeader: true,
            width: "auto",
            renderCell: (row: CommitInfo) => (
                <Link
                    href={`https://github.com/${row.repo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                        color: linkColor,
                        textDecoration: "none",
                    }}
                >
                    {row.repo}
                </Link>
            ),
        },
        {
            header: "Author",
            field: "author",
            rowHeader: true,
            width: "auto",
            // Note: Doesn't work perfectly if author's name doesn't match GitHub username
            renderCell: (row: CommitInfo) => (
                <Link
                    href={`https://github.com/${row.author}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                        color: linkColor,
                        textDecoration: "none",
                    }}
                >
                    {row.author}
                </Link>
            ),
        },
        {
            header: "Commit Date",
            field: "date",
            rowHeader: true,
            width: "auto",
        },
        {
            header: "Commit Message",
            field: "message",
            rowHeader: true,
            width: "auto",
        },
        {
            header: "URL",
            field: "url",
            rowHeader: true,
            width: "auto",
            renderCell: (row: CommitInfo) => (
                <Box
                    sx={{
                        whiteSpace: "normal",
                        wordBreak: "break-all",
                        overflowWrap: "break-word",
                        minWidth: "100px",
                    }}
                >
                    <Link
                        href={row.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                            color: linkColor,
                            textDecoration: "none",
                        }}
                    >
                        {row.url}
                    </Link>
                </Box>
            ),
        },
    ];

    return (
        <Box>
            {/* Container for search input */}
            <Box mb={2}>
                <TextInput
                    placeholder="Search by commit message..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search commit messages"
                    sx={{width: "30%"}}
                />
            </Box>

            <Box
                sx={{
                    maxHeight: "510px",
                    overflowY: "auto",        
                }}>
            
                <Table.Container>
                    <DataTable
                        // Table will be populated with filtered data
                        data={filteredData}
                        columns={columns}
                    />
                </Table.Container>
            </Box>
        </Box>
    );
};

export default CommitTable;

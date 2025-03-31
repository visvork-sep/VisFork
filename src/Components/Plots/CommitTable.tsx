import { Column, DataTable, Table } from "@primer/react/experimental";
import { Box, Link, TextInput, useTheme } from "@primer/react";
import { useState } from "react";
import { CommitTableData, CommitTableDetails } from "@VisInterfaces/CommitTableData";

function CommitTable({ commitData }: CommitTableData) {
    if (commitData.length) console.log(commitData[0].login);

    // Fetch current color mode (light or dark)
    const { colorMode } = useTheme();

    // To track text input for filtering
    const [searchTerm, setSearchTerm] = useState("");

    // Filter data based on current search term
    const filteredData = commitData.filter((commit) =>
        commit.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Determine hyperlink color based on color mode
    const isDarkMode = colorMode === "dark" || colorMode === "night";
    const linkColor = isDarkMode ? "white" : "black";

    // Define how each column will be displayed
    const columns: Column<CommitTableDetails>[] = [
        {
            header: "Owner/Repo",
            field: "repo",
            rowHeader: true,
            width: "auto",
            renderCell: (row: CommitTableDetails) => (
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
            renderCell: (row: CommitTableDetails) => (
                <Link
                    // This is the link to the author's GitHub profile using the username
                    href={`https://github.com/${row.login}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                        color: linkColor,
                        textDecoration: "none",
                    }}
                >
                    {/* This is the author's name, which is not the username */}
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
            header: "Hash",
            field: "id",
            rowHeader: true,
            width: "auto",
            renderCell: (row: CommitTableDetails) => (
                <Box
                    sx={{
                        whiteSpace: "normal",
                        wordBreak: "break-all",
                        overflowWrap: "break-word",
                        minWidth: "50px",
                    }}
                >
                    <Link
                        href={`https://github.com/${row.repo}/commit/${row.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                            color: linkColor,
                            textDecoration: "none",
                        }}
                    >
                        {/* Short version of the commit hash */}
                        {row.id.substring(0, 7)}
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
                    sx={{ width: "30%" }}
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

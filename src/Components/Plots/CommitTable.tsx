import { Column, DataTable, Table } from "@primer/react/experimental";
import { Box, Link, TextInput, useTheme } from "@primer/react";
import { useState, useMemo, memo, useEffect } from "react";
import { CommitTableData, CommitTableDetails } from "@VisInterfaces/CommitTableData";

function CommitTable({ commitData }: CommitTableData) {
    // Fetch current color mode (light or dark)
    const { colorMode } = useTheme();

    // Track text input for filtering
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Memoize hyperlink color based on color mode
    const linkColor = useMemo(() => {
        return colorMode === "dark" || colorMode === "night" ? "white" : "black";
    }, [colorMode]);

    // Setup a bit of delay for the search input to avoid excessive re-renders
    useEffect(() => {
        if (searchTerm !== debouncedSearch) {
            const handler = setTimeout(() => {
                setDebouncedSearch(searchTerm);
                console.log("Search term updated:", searchTerm);
            }, 3000); // 300ms delay

            return () => clearTimeout(handler);
        }
    }, [searchTerm, debouncedSearch]); // Prevent unnecessary updates


    const preprocessedData = useMemo(() => {
        return commitData.map(commit => ({
            ...commit,
            lowerMessage: commit.message.toLowerCase() // Store lowercase message
        }));
    }, [commitData]);

    // Memoize filtered data to prevent unnecessary recalculations
    const filteredData = useMemo(() => {
        console.log("Filtering data with search term:", debouncedSearch); // Debugging log
        const lowerSearch = debouncedSearch.toLowerCase(); // Convert search term to lowercase once

        return preprocessedData.filter(commit =>
            commit.lowerMessage.includes(lowerSearch) // Use precomputed lowercase message
        );
    }, [preprocessedData, debouncedSearch]);


    // Memoize column definitions
    const columns: Column<CommitTableDetails>[] = useMemo(() => [
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
                    sx={{ color: linkColor, textDecoration: "none" }}
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
                    sx={{ color: linkColor, textDecoration: "none" }}
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
                        sx={{ color: linkColor, textDecoration: "none" }}
                    >
                        {row.id.substring(0, 7)}
                    </Link>
                </Box>
            ),
        },
    ], [linkColor]);

    return (
        <Box>
            {/* Container for search input */}
            <Box mb={2}>
                <TextInput
                    placeholder="Search by commit message..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search commit messages"
                    sx={{ width: "30%", minWidth: "200px" }}
                />
            </Box>

            <Box sx={{ maxHeight: "510px", overflowY: "auto" }}>
                <Table.Container>
                    <DataTable data={filteredData} columns={columns} />
                </Table.Container>
            </Box>
        </Box>
    );
};

export default memo(CommitTable);

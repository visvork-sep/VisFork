import {DataTable, Table} from '@primer/react/experimental';
import { Box, Link, TextInput, useTheme } from '@primer/react';
import commitData from './commit_data_example.json';
import { useState } from 'react';

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

    const {colorMode} = useTheme();

    const [searchTerm, setSearchTerm] = useState('');

    const data: CommitInfo[] = commitData;

    const filteredData = data.filter((commit) =>
        commit.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isDarkMode = colorMode === 'dark' || colorMode === 'night';
    const linkColor = isDarkMode ? 'white' : 'black';

    return (
        <Box>
            <Box mb={2}>
                <TextInput
                    placeholder="Search by commit message..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search commit messages"
                    style={{width: '300px'}}
                />
            </Box>

            <Box
                sx={{
                    maxHeight: '510px',
                    overflowY: 'auto',        
                }}>
            
                <Table.Container>
                    <DataTable
                        data={filteredData}
                        columns={[
                            {
                                header: 'Owner/Repo',
                                field: 'repo',
                                rowHeader: true,
                                width: 'auto',
                                renderCell: row => (
                                    <Link
                                        href={`https://github.com/${row.repo}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={{
                                            color: linkColor,
                                            textDecoration: 'none',
                                        }}
                                    >
                                        {row.repo}
                                    </Link>
                                )
                            },
                            {
                                header: 'Author',
                                field: 'author',
                                rowHeader: true,
                                width: 'auto',
                                // Doesn't work perfectly rn, since author's name can differ from the username, 
                                // and url is based on username which we don't have
                                renderCell: row => (
                                    <Link
                                        href={`https://github.com/${row.author}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={{
                                            color: linkColor,
                                            textDecoration: 'none',
                                        }}
                                    >
                                        {row.author}
                                    </Link>
                                )
                            },
                            {
                                header: 'Commit Date',
                                field: 'date',
                                rowHeader: true,
                                width: 'auto',
                            },
                            {
                                header: 'Commit Message',
                                field: 'message',
                                rowHeader: true,
                                width: 'auto',
                            },
                            {
                                header: 'URL',
                                field: 'url',
                                rowHeader: true,
                                width: 'auto',
                                renderCell: row => (
                                    <Box
                                        sx={{
                                            whiteSpace: 'normal',
                                            wordBreak: 'break-all',
                                            overflowWrap: 'break-word',
                                            minWidth: '100px'
                                        }}
                                    >
                                        <Link
                                            href={row.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                color: linkColor,
                                                textDecoration: 'none',
                                            }}
                                        >
                                            {row.url}
                                        </Link>
                                    </Box>
                                )},
                        ]}
                    />
                </Table.Container>
            </Box>
        </Box>
    );
};

export default CommitTable;
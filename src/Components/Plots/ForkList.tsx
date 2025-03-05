import { Box, Text, Select } from "@primer/react";
import { DataTable, Table } from "@primer/react/experimental";
import { useState } from "react";

// Interface of a fork
export interface Fork {
    id: number,
    full_name: string, // Name in the Owner/Repository format
    description: string | null,
}

// Interface of the props object
interface ForkListProps {
    forks: Fork[]
}

function ForkList({ forks }: ForkListProps) {

    // States to control page size and current page index
    const [pageSize, setPageSize] = useState(10);
    const [pageIndex, setPageIndex] = useState(0);

    // Calculate the items to display on the current page
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    const forksToShow = forks.slice(start, end);

    return (
        <Table.Container>
            <Table.Title as="h2" id="forks">
                Forks
            </Table.Title>

            <Table.Actions>
                <Box display="flex" alignItems="center">
                    <Text as="span" size="medium" weight="semibold" padding="1">
                        Rows per page
                    </Text>
                    <Select
                        size="medium"
                        // Set the page size the user chosen value and reset the page index
                        onChange={(e) => {
                            setPageIndex(0);
                            setPageSize(Number(e.target.value));
                        }}
                        defaultValue={pageSize.toString()}
                    >
                        {
                            // Create a list of nums from 1 to 100 and map it to option buttons
                            Array.from({ length: 100 }, (_, i) => i + 1).map((value) => (
                                <Select.Option key={value} value={value.toString()}>
                                    {value}
                                </Select.Option>
                            ))
                        }
                    </Select>
                </Box>
            </Table.Actions>

            <Table.Subtitle as="p" id="forks-subtitle">
                A list of all the forks of the submitted repository.
            </Table.Subtitle>

            <DataTable
                aria-labelledby="forks"
                aria-describedby="forks-subtitle"
                data={forksToShow}
                columns={[
                    {
                        header: "Name",
                        field: "full_name",
                        rowHeader: true,
                    },
                    {
                        header: "Description",
                        field: "description",
                        rowHeader: true,
                    },
                ]}
            />

            <Table.Pagination
                // By changing the key, the component will re-render when the page size changes
                // This is necessary to update the page index when the page size changes
                key={pageSize}
                aria-label="Pagination for Forks"
                pageSize={pageSize}
                totalCount={forks.length}
                onChange={({ pageIndex }) => {
                    setPageIndex(pageIndex);
                }}
            />
        </Table.Container>
    );
}

export default ForkList;

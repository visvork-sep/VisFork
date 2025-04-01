import { Box, Text, Select } from "@primer/react";
import { DataTable, Table } from "@primer/react/experimental";
import { useState, useMemo, memo } from "react";
import { ForkListData, ForkListDetails } from "@VisInterfaces/ForkListData";

function ForkList({ forkData }: ForkListData) {
    // States to control page size and current page index
    const [pageSize, setPageSize] = useState(10);
    const [pageIndex, setPageIndex] = useState(0);

    // Memoize the items to display on the current page
    const forksToShow = useMemo(() => {
        const start = pageIndex * pageSize;
        const end = start + pageSize;
        return forkData.slice(start, end);
    }, [forkData, pageSize, pageIndex]);

    // Memoize column definitions
    const dataColumns = useMemo(() => [
        { header: "Name", field: "name" as keyof ForkListDetails, rowHeader: true },
        { header: "Description", field: "description" as keyof ForkListDetails, rowHeader: true },
    ], []);

    return (
        <Table.Container>
            <Table.Title as="h2" id="forks">Forks</Table.Title>

            <Table.Actions>
                <Box display="flex" alignItems="center">
                    <Text as="span" size="medium" weight="semibold" padding="1">
                        Rows per page
                    </Text>
                    <Select
                        size="medium"
                        onChange={(e) => {
                            setPageIndex(0);
                            setPageSize(Number(e.target.value));
                        }}
                        defaultValue={pageSize.toString()}
                    >
                        {Array.from({ length: 100 }, (_, i) => i + 1).map((value) => (
                            <Select.Option key={value} value={value.toString()}>
                                {value}
                            </Select.Option>
                        ))}
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
                columns={dataColumns}
            />

            <Table.Pagination
                key={pageSize}
                aria-label="Pagination for Forks"
                pageSize={pageSize}
                totalCount={forkData.length}
                onChange={({ pageIndex }) => setPageIndex(pageIndex)}
            />
        </Table.Container>
    );
}

export default memo(ForkList);

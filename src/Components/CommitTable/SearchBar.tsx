// components/SearchBar.tsx
import { Box, Button, TextInput } from "@primer/react";
import { useState } from "react";

interface SearchBarProps {
    onSearch: (term: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
    const [inputValue, setInputValue] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(inputValue);
    };

    return (
        <Box mb={2} as="form" onSubmit={handleSubmit} sx={{ display: "flex", gap: 2 }}>
            <TextInput
                placeholder="Search by commit message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                aria-label="Search commit messages"
                sx={{ width: "30%", minWidth: "200px" }}
            />
            <Button type="submit">Search</Button>
        </Box>
    );
};

export default SearchBar;

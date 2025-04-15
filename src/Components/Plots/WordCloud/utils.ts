// import { stemmer } from "stemmer";
import { lemmatizer } from "lemmatizer";
import { removeStopwords } from "stopword";

// Interface that defines the structure of a Word object
export interface Word {
    text: string;
    size: number;
    frequency: number;
    rotate?: number;
    x?: number;
    y?: number;
}

// Simple tokenizer function
export const tokenize = (text: string) => {
    return text.split(/\s+/).filter((token) => token.length > 1);
};

// Define the processing functions
// export const stemmingFunction = (token: string) => stemmer(token);
export const lemmatizationFunction = (token: string) => {
    if (typeof token !== "string") {
        return token;
    }

    // List of known prototype properties to exclude
    const prototypeProperties = [
        "constructor", "__proto__", "hasownproperty", 
        "isprototypeof", "propertyisenumerable", 
        "tolocalestring", "tostring", "valueof"
    ];

    // Check if the token is a prototype property, which would cause an internal error
    if (prototypeProperties.includes(token)) {
        return token; // Return token as-is (could be changed for something better)
    }

    try {
        const lemmatized = lemmatizer(token);
        if (typeof lemmatized !== "string") {
            console.error(`Lemmatizer returned non-string value for token "${token}":`, lemmatized);
            return token;
        }
        return lemmatized;
    } catch (error) {
        console.error(`Error in lemmatizer for token "${token}":`, error);
        return token; // Fallback to the original token
    }
};

// Function to process commit messages and generate word frequencies
export const processCommitMessages = (
    data: string [],
    processToken: (token: string) => string,
    start: number,
    finish: number,
    maxSize = 100,
    minSize = 25
): Word[] => {
    const wordFreq: Record<string, number> = {};

    // Iterate through each message and tokenize it
    data.forEach( (message: string ) => {
        const tokens = tokenize(message);
        const filteredTokens = removeStopwords(tokens).filter(token => /^[a-zA-Z]+$/.test(token));

        // Process each token and update the frequency count
        filteredTokens.forEach((token: string) => {
            let processedWord;
            try {
                processedWord = processToken(token.toLowerCase() + "");
                if (typeof processedWord !== "string" || processedWord.trim() === "") {
                    throw new Error("Invalid processed word");
                }
            } catch (error) {
                console.error(`Error processing token "${token}":`, error);
                processedWord = token.toLowerCase(); // Fallback to original token
            }

            wordFreq[processedWord] = (wordFreq[processedWord] || 0) + 1;
        });
    });

    // Convert frequencies to an array
    let sortedWords = Object.entries(wordFreq)
        .map(([word, freq]) => ({ text: word, frequency: freq, size: freq }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(Math.max(0, start), Math.min(Object.keys(wordFreq).length, finish));

    if (sortedWords.length === 0) return [];

    // Normalize sizes using log scaling
    const maxFreq = sortedWords[0].frequency;

    sortedWords = sortedWords.map(({ text, frequency }) => ({
        text,
        frequency,
        size: minSize + ((Math.log(frequency + 1) / Math.log(maxFreq + 1)) * (maxSize - minSize))
    }));


    return sortedWords;
};

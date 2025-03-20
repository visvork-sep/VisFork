// import { stemmer } from "stemmer";
import { lemmatizer } from "lemmatizer";
import { removeStopwords } from "stopword";

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
    if (typeof token !== 'string') {
        return token;
    }
    const lemmatized = lemmatizer(token);
    if (typeof lemmatized !== 'string') {
        console.error(`Lemmatizer returned non-string value for token "${token}":`, lemmatized);
        return token;
    }
    return lemmatized;
};


export const processCommitMessages = (
    data: any, 
    processToken: (token: string) => string, 
    start: number, 
    finish: number, 
    maxSize: number = 100, 
    minSize: number = 25  
): Word[] => {
    const wordFreq: { [key: string]: number } = {};

    data.forEach((commit: any) => {
        const tokens = tokenize(commit.message);
        const filteredTokens = removeStopwords(tokens).filter(token => /^[a-zA-Z]+$/.test(token));

        filteredTokens.forEach((token: string) => {
            let processedWord;
            try {
                processedWord = processToken(token.toLowerCase() + "");
                if (typeof processedWord !== 'string' || processedWord.trim() === '') {
                    throw new Error('Invalid processed word');
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
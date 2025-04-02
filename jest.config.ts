import { Config } from "jest";

const config : Config = {
    coverageReporters: ["json", "html", "text"],
    globals: {
        "ts-jest": {
            tsconfig: "tsconfig.json"
        }
    },
    moduleFileExtensions: [
        "ts",
        "js"
    ],
    moduleNameMapper: {
        "@hello/(.*)": "<rootDir>/src/hello/$1"
    },
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
    testMatch: [
        "**/test/**/*.test.(ts|js)"
    ],
    testEnvironment: "node"
};

export default config;
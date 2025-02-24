import type { CodegenConfig } from "@graphql-codegen/cli";
 
const config: CodegenConfig = {
    schema: "schema.graphql",
    documents: ["src/**/*.tsx", "src/**/*.graphql"],
    generates: {
        "./__generated__/": {
            preset: "client",
        },
    },
};

export default config;
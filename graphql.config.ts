import type { IGraphQLConfig } from "graphql-config";

const config : IGraphQLConfig = {
    schemaPath: "schema.graphql",
    documents: "src/**/*.graphql",
};

export default config;

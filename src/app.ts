import { useApolloClient, useQuery } from "@apollo/client";

import { MyQueryDocument, MyQueryQuery } from "@__generated__/graphql";

import { ApolloClient } from "@apollo/client";

useQuery(MyQueryDocument, {
    variables: {
        first: 10
    }
});

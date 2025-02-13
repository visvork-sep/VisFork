# Guide to GraphQL for GitHub API
## Primary sources
### Getting started with Github API
https://docs.github.com/en/graphql/guides/forming-calls-with-graphql
### Getting started with GraphQL
https://graphql.org
### GraphQL Schema
https://docs.github.com/en/graphql/overview/public-schema
### Code generation
https://the-guild.dev/graphql/codegen/plugins/typescript/typed-document-node
https://the-guild.dev/graphql/codegen/plugins/typescript/typescript
https://the-guild.dev/graphql/codegen/plugins/typescript/typescript-operations
## Why GraphQL?
GraphQL is an alternative to REST Endpoints to access and or update data from a server. Their strength lies in the fact that the client can decide exactly what data they need and what they don't and are thus not limited to the interface that the REST endpoints provide. It allows the client to get the same data with less API calls.

## Example

### GraphQL
``` GraphQL
query q {
    repository(owner: "torvalds", name: "linux") {
        forks(first: 100 ) {
            nodes {
                forks(first: 100) {
                    nodes {
                        name
                    }
                }
            }
        }
    }
}

```

### REST

1. Get the forks of the main repo
``` HTTP
GET https://api.github.com/repos/torvalds/linux/forks?per_page=100
```

This returns an array of fork objects. Each fork object will have fields like:
``` json
[
    {
        "id": 123456,
        "name": "linux",
        "full_name": "some-user/linux",
        "owner": {
            "login": "some-user"
        },
        ...
    },
    ...
]

```

2. For each of those 100 forks, get its first 100 forks

Using information from the first api call, where we retrieved the owner as well as the repository name, we can now query that repository to find it's forks.

```
GET https://api.github.com/repos/some-user/linux/forks?per_page=100
```

### Conclusion

This means that to complete this equivalent query we would need to complete 101 API calls.

Additionally when querying through the REST API, we would also receive a bunch of data we don't need but are returned by default by the endpoint which impacts performance.


## How to use GraphQL
This short guide will teach you how to use GraphQL, specficially to access the GitHub GraphQL API.

### Schemas
Simply put, just like SQL Schemas they GraphQL Schemas dictate what is possible to query. as seen in ```.devcontainer/devcontainer.json```, we are using the schema github has provided on their website. You can inspect the ```schema.graphql``` file in the root folder of the project if you are using the devcontainer. Otherwise, run this script. 

```curl -o schema.graphql https://docs.github.com/public/fpt/schema.docs.graphql```

Every .graphql file made in the project will be checked against the schema file.

Rather than reading the schema directly I recommend exporing it in some kind of tool. This is the most important part of being able to query properly, if you have struggles with this, do reach out.

### Queries
A query is how you read or fetch data from the server. You can see it as the dataset as a directed graph and you are retrieving a subgraph with a query. **Nodes** and **edges**/**connections** both have fields, those fields are the actual data that we are trying to retreive. Example:

#### Terms
``` GraphQL
query GetJohns { # Query name
  users(name: "john") { # [Node] with argument
    id # Field
    name #Field
    friends(first: 100) { # [Connection] with argument
        nodes { # [Node]
            name # Field
        }
    }
  }
}
# retrieval of id and name of all users, whose name is john + their friends' names
```

This is what a posssible returned value might look like 
``` json
[ // List
    { //UserObject
        "id": 1, 
        "name": "john",
        "friends": { // FriendsConnection object
            "nodes" : [ // List
                {
                    "name": "Amy"
                },
                ...
            ]
        }
    },
    ...
]
```

Of course you don't have to query lists, you could also query a specific node if the schema allows it. You can also add aliases to make returned values easier to digest, this is especially useful when you have nested queries.

``` GraphQL
Query GetJohn {
    User(id: 1) : USER { # Node
        name : NAME # Field
    }
}
```

#### Variables
Up until now we have only used static queries, what if you wanted to modify an argument based on something that is going on in the UI? (You will)

Similarily to variables in SQL you define them in the graphql file. to add a variable we replace the litteral with ```$<variablename>``` and add it as an input parameter to the query. Note that you have to specify the type of the variable as well. 

Additionally you can specify that this is a non nullable variable using `!` or you could have default variables by setting a default value.

``` GraphQL
query GetUsersWithName($name : String!, $lastName: String = "Doe") {
    Users(name: $name, lastName: $lastName) {
        id
    }
}
```


#### Fragments
Fragments allow you to avoid code duplication. Consider the following query where we require the same attributes from the same object types.

``` GraphQL
query JohnsAndMaxes($friendsAge: Int) {
    Users(name: "John") {
        name,
        age,
        favourite_meal,
        favourite_drink,
        friends(age: $friendsAge) {
            name
        }
        ...
    },
    Users(name: "Max") {
        name,
        age,
        favourite_meal,
        favourite_drink,
        friends(age: $friendsAge) {
            name
        }
        ...
    },
}
```

Using Fragments we could rewrite this as.

``` GraphQL
query JohnsAndMaxes($friendsAge: Int) {
    Users(name: "John") {
        ...fields
    },
    Users(name: "Max") {
        ...fields
    },
}

fragment fields on User {
    name,
    age,
    favourite_meal,
    favourite_drink
    friends(age: $friendsAge) {
            name
        }
    ...
}
```

Fragments are specific to an object type, they are unrelated to the names of the fields. So look to incorporate fragments only if the object types match. Note that fragments inherit the variables in the scope of the parent.

#### How to add a query 
1. Create a .graphql and write your query
2. Run ```npm run generate``` to update the type generations from the graphql queries. This will add your new query at the bottom of the graphql.ts file in the form of ```<QueryName>Document``` with a typing of ``` DocumentNode<<QueryNameQuery>Query, Exact<{<variables>}>>  ``` (). This is a constant variable that represents your query. 
3. Use the generated constant to query in conjunction with Apollo client (idk if this is how apollo client works, test this with react)
``` Typescript
import { useQuery } from "@apollo/client";

import { MyQueryDocument } from "./__generated__/graphql";

useQuery(MyQueryDocument, {
    variables: {
        first: 10
    }
});

```


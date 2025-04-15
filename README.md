# VisFork

## Description

VisFork is a web-based visualization tool designed to analyze the evolution of fork ecosystems on GitHub. It was developed by team **4ks** from Eindhoven University of Technology as part of a Software Engineering Project. The application provides interactive visualizations that help developers, researchers, and maintainers understand project evolution, commit trends, collaboration networks, and much more.

VisFork connects with GitHub via OAuth 2.0 and utilizes both the GraphQL and REST APIs to dynamically fetch repository and fork data. It is built with React, TypeScript, and D3.js, and is optimized for scalability and extendability.

It provides severval visualizations for forks of a target repository to help developers understand the system.

### Key Features

- **Commit Histogram** and **Timeline** visualizations
- **Fork list** and **Collaboration Network Graph**
- **Commit Classification Sankey Diagram**
- **Commit Table** and **Word Cloud**
- Interactive filtering and sorting
- Exporting visualizations and raw data
- GitHub OAuth authentication

---

## Devcontainer
To make sure the project runs the same way for everyone (e.g. if there is an error in the code, it will not build for anyone with the same code, no matter whether they are on Windows, Linux, Max, etc.), VisFork uses a **DevContainer** setup. This is done through the use of the .devcontainer directory, containing the devcontainer.json.

### Setup Steps

To get Devcontainer set up locally, follow these steps: 

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop) and follow its install instructions.

2a. For VSCode, install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) for VS Code

2b. If you are developing in WebStorm, you already have native support for dev containers, so review [this website](https://www.jetbrains.com/help/webstorm/start-dev-container-inside-ide.html) to make sure you open the project in the specified dev container.


3. Open the repository in VS Code, and select **"Reopen in Container"** when prompted

If the prompt doesn't show:
- Ensure Docker Desktop is running
- Press `Ctrl + Shift + P` and choose `Dev Containers: Open Folder in Container...`

This will open a new VSCode window in which everything will be running in the dev container. Make sure to use the terminal in VSCode to ensure consistent behaviour. 
## Installation
### Prerequisites

- [Node.js](https://nodejs.org/en)
- A GitHub OAuth App for authentication (Client ID and Secret required)
- Docker (for dev container and local backend)
- [Nginx](https://www.nginx.com/) (for production serving, optional)


### Steps

```bash
npm install           # Install dependencies in the root folder
cd ./backend          # Switch to the bckend folder
npm install           # Install dependencies backend
cd ..
npm run generate      # Generate __generated__ folder for GraphQL types
npm run dev           # Start the development server
```
For backend authentication and production deployment, refer to the Software Transfer Document.


### Common Issues
#### After opening the devcontainer, all of my files appear to be modified according to Git. What do I do?
This is a common issue with Windows machines. Try one or both of the following commands, they should resolve your issue:

```bash
# For the current repository
git config core.filemode false   

# Globally
git config --global core.filemode false
```

And/or:

```bash
# For the current repository
git config core.autocrlf true  

# Globally
git config --global core.autocrlf true
```

#### Whenever I try to reopen the repository in the devcontainer, it just simply states it gave an error and my only option is to retry. What do I do?
The devcontainer terminal log might say something about Windows permissions. Try deleting the `node_modules` folder and reopening again. This might fix your issue, hopefully.

#### npm run generate runs into an error of a missing file
Execute the following command in the root folder to fix this issue: 
```bash
npm install && curl -o schema.graphql https://docs.github.com/public/fpt/schema.docs.graphql && curl https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.2022-11-28.yaml -L -o openapi-schema.yaml

```
After the execution of this command the 
```bash 
npm run generate
``` 
should execute without a problem.


## Testing
To run tests:
```bash 
npm run test
```
All files except test files in the src folder are included. Test files are named ```**/*.test.*```, additionally queries are excluded from testing because they rely on an external service. Understand analysis is performed on all files in the ``src`` folder except test files.

Simian is not usable with VisFork because Simian does not support tsx files and often flags html as duplication.

## Architecture Overview
VisFork follows a modular and scalable design:

- Frontend: React, TypeScript, D3.js, Tailwind CSS

- Backend: Node.js with Express for handling GitHub OAuth

- Data: Fetched dynamically via GitHub GraphQL and REST APIs

- DevOps: CI/CD pipelines via GitHub Actions

More details are in the Software Design Document.

## Project Status
 All core visualizations implemented

 Unit tests and acceptance tests included

 No user data is stored; authentication only uses access tokens temporarily during session

 Some features like image export, tutorial, and visualization label toggling are still under development

## License
This project is licensed under the MIT License - see the [LICENSE](README.md) file for details.

## Authors
Developed by the team 4ks: Quinn Caris, Aleks Chitalov, Nickolay Frissen, Jason Fu, Kasra Gheytuli, Krasimira Kamenska, Kaloyan Konarev, Alva Shudofsky, Carina Ungureanu, Gergely Vész, Gábor Viniczay

# VisFork
This project aims to visualize the evolution of fork ecosystems in GitHub. It provides severval visualizations for forks of a target repository to help developers understand the system.
### Local set-up
To make sure the project runs the same way for everyone (e.g. if there is an error in the code, it will not build for anyone with the same code, no matter whether they are on Windows, Linux, Max, etc.), the project uses a dev container. This is done through the use of the .devcontainer directory, containing the devcontainer.json.

To get this set up locally, install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and follow its install instructions.

For VSCode, you install the [Dev Containers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers). If you are developing in WebStorm, you already have native support for dev containers, so review [this website](https://www.jetbrains.com/help/webstorm/start-dev-container-inside-ide.html) to make sure you open the project in the specified dev container.

Once you open the project in VSCode with the Dev Containers extension installed, a pop-up will appear prompting you to reopen the project in a dev container. In case this does not pop-up, make sure Docker Desktop is running, and press `Ctrl + Shift + P` and run `Dev Containers: Open Folder in Container...`.

This will open a new VSCode window in which everything will be running in the dev container. Make sure to use the terminal in VSCode to ensure consistent behaviour. Good luck contributing!

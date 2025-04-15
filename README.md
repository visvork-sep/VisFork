# VisFork

## Description
This project aims to visualize the evolution of fork ecosystems in GitHub. It provides severval visualizations for forks of a target repository to help developers understand the system.

### Devcontainer
To make sure the project runs the same way for everyone (e.g. if there is an error in the code, it will not build for anyone with the same code, no matter whether they are on Windows, Linux, Max, etc.), the project uses a dev container. This is done through the use of the .devcontainer directory, containing the devcontainer.json.

To get this set up locally, install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and follow its install instructions.

For VSCode, you install the [Dev Containers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers). If you are developing in WebStorm, you already have native support for dev containers, so review [this website](https://www.jetbrains.com/help/webstorm/start-dev-container-inside-ide.html) to make sure you open the project in the specified dev container.

Once you open the project in VSCode with the Dev Containers extension installed, a pop-up will appear prompting you to reopen the project in a dev container. In case this does not pop-up, make sure Docker Desktop is running, and press `Ctrl + Shift + P` and run `Dev Containers: Open Folder in Container...`.

This will open a new VSCode window in which everything will be running in the dev container. Make sure to use the terminal in VSCode to ensure consistent behaviour. 

### Common Issues
#### All of my files appear to be modified according to Git. What do I do?
This is a common issue with Windows machines. Try one or both of the following commands, they should resolve your issue:

```
# For the current repository
git config core.filemode false   

# Globally
git config --global core.filemode false
```

And/or:

```
# For the current repository
git config core.autocrlf true  

# Globally
git config --global core.autocrlf true
```

#### Whenever I try to reopen the repository in the devcontainer, it just simply states it gave an error and my only option is to retry. What do I do?
The devcontainer terminal log might say something about Windows permissions. Try deleting the `node_modules` folder and reopening again. This might fix your issue, and if not, God help you.

### Remaining installation steps

Also be sure to install [NodeJS](https://nodejs.org/en) and run `npm i` in the root directory of the project.

Don't forget to run `npm run generate` to generate the `__generated__` folder. This is necessary to generate the needed types for the queries to work.

To run the project in developer mode, run `npm run dev`.

Good luck contributing!

### Testing
run ```npm run test```. All files except test files in the src folder are included. Test files are named ```**/*.test.*```, additionally queries are excluded from testing because they rely on an external service. Understand analysis is performed on all files in the ``src`` folder except test files.

Simian is not usable with VisFork because Simian does not support tsx files and often flags html as duplication.

## License
This project is licensed under the MIT License - see the [LICENSE](README.md) file for details.

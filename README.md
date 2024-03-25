# SteamIconRecovery

## Overview

SteamIconRecovery is a utility tool designed to simplify the process of recovering game icons and creating shortcuts for Steam games installed on your system. It streamlines the task by automating the retrieval of game icons from the Steam API and generating corresponding shortcuts.

## How it Works

1. **Loading Library Folders**: SteamIconRecovery begins by parsing your `libraryfolders.vdf` file, which contains information about all the folders where your games are installed.

2. **Connecting to Steam API**: The tool connects to the Steam API anonymously to gather necessary data.

3. **Processing Games**:
    - For each game detected:
        - Retrieves game icon and name from the Steam API.
        - Downloads the icon and saves it locally.
        - Creates a new shortcut for the game.

## Running the Project

To run this project, follow these steps:

1. **Edit Configuration**:
    - Open `config.json` and adjust the settings according to your system configuration. Ensure that paths are correctly specified. Replace `{user}` with your Windows user folder.

```json
{
  "steamPath": "C:\\Program Files (x86)\\Steam\\steamapps\\libraryfolders.vdf",
  "iconPath": "C:\\Program Files (x86)\\Steam\\steam\\games",
  "startUpMenuPath": "C:\\Users\\{user}\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Steam" 
}
```

2. **Install Dependencies**:
    - Run `npm i` in your terminal to install the required dependencies.

3. **Start the Application**:
    - Execute `npm start` in your terminal to initiate the process.

import fs from 'fs';
import * as VDF from 'vdf-parser';
import SteamUser from 'steam-user'
import config from './config.json' assert { type: 'json' };
const {steamPath,iconPath,startUpMenuPath} = config;
const user = new SteamUser();

// Function to detect the games installed on the system by reading the steam libraryfolders.vdf file and extracting the appids
function detectGames() {
    return fs.promises.readFile(steamPath,"utf-8")
    .then(VDF.parse)
    .then(({libraryfolders})=>libraryfolders) // Extract the libraryfolders object
    .then(Object.values) // Convert the object to an array of values
    .then(disks=>disks.map(({apps})=>apps)) // Extract the apps object from each disk
    .then(apps=>apps.flatMap(Object.keys)) // Extract the gameId from each disk
}

// Function to log in to the steam account
function login() {
    return new Promise((resolve,reject)=>{
        user.logOn({anonymous: true});
        user.on('loggedOn',()=>resolve());
        user.on('error',reject);
    });
}

// Function to get the game information from the steam store
function getGameInfo(gameId) {
    return new Promise((resolve, reject) => {
        user.getProductInfo([+gameId], [], (error,apps) => {
            if(error) reject(error);
            resolve({
                name: apps[gameId].appinfo.common.name,
                icon: apps[gameId].appinfo.common.clienticon,
                appid: apps[gameId].appinfo.appid
            });
        });
    });
}

// Function to download the game icon from the steam store
async function donwloadGameIcon(gameId,icon) {
    const response = await fetch(`https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/${gameId}/${icon}.ico`);
    const data = await response.arrayBuffer();
    return await fs.promises.writeFile(iconPath + `\\${icon}.ico`, Buffer.from(data));
                
}

// Function to create a shortcut in the start menu
function createShortcut(name,appid,icon) {
    return fs.promises.writeFile(startUpMenuPath+`\\${name}.url`, `[InternetShortcut]\nURL=steam://rungameid/${appid}\nIconFile=${iconPath}\\${icon}.ico\nIconIndex=0`)
}

const success = [];
const failed = [];

await Promise.all([
    detectGames().catch(()=>{throw new Error("cannot detect games")}),
    login().catch(()=>{throw new Error("cannot login")})
])
.then(async ([games])=>{

    console.log(`${games.length} games found`);
    for await (const appid of games) {
        try{
            const percent = Math.floor((success.length+failed.length)/games.length*10000)/100;
            process.stdout.clearLine();
            process.stdout.write(`${percent}% : ${appid} Downloading game information...\r`);
            const game = await getGameInfo(appid).catch(()=>{throw new Error(appid + " : cannot get game info")});
            process.stdout.clearLine();
            process.stdout.write(`${percent}% : ${appid} Downloading game icon for ${game.name}...\r`);
            await donwloadGameIcon(appid).catch(()=>{throw new Error(game.name + " : cannot download game icon")});
            process.stdout.clearLine();
            process.stdout.write(`${percent}% : ${appid} Created shortcut for ${game.name}...\r`);
            await createShortcut(game.name,game.appid,game.icon).catch(()=>{throw new Error(game.name +" : cannot create shortcut")});
            success.push(game.name);
        }
        catch(error){
            failed.push(error.message);
            process.stdout.clearLine();
            console.log('\x1b[31m',error.message,'\x1b[0m');
        }
    }
})
.then(()=>{
    process.stdout.clearLine();
    console.log('\x1b[32m',success.length + " games successfully created",'\x1b[0m');
    success.forEach(game=>console.log('\x1b[32m',game,'\x1b[0m'));
    console.log('\x1b[31m',failed.length + " games failed",'\x1b[0m');
    failed.forEach(game=>console.log('\x1b[31m',game,'\x1b[0m'));
})
.catch(console.error)
.finally(()=>user.logOff());


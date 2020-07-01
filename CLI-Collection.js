const jsl = require("svjsl");
const fs = require("fs-extra");
const keypress = require("keypress");
const childProcess = require("child_process");
const { resolve } = require("path");

const col = Object.freeze({ rst: jsl.colors.rst, ...jsl.colors.fg });

keypress(process.stdin);


/**
 * @typedef {Object} Game
 * @prop {String} name
 * @prop {String} path
 * @prop {String} dir
 */

/**
 * @typedef {Object} GameFiles
 * @prop {Array<Game>} win
 * @prop {Array<Game>} mac
 * @prop {Array<Game>} linux
 */


/**
 * Initializes everything
 */
function initAll()
{
    init();
}

/**
 * Initializes the menu
 */
function init()
{
    try
    {
        let allGameFiles = getGameFiles();
        let gameFiles = allGameFiles[getOS()];

        console.log(gameFiles);

        let mp = new jsl.MenuPrompt({
            autoSubmit: true,
            exitKey: "x",
            onFinished: (res) => {
                if(!Array.isArray(res) || res.length <= 0)
                    process.exit(0);
                
                let fileToExec = gameFiles.find(f => f.name == res[0].description);

                execFile(fileToExec.path, resolve(fileToExec.dir));
            }
        });

        let mpGames = [];

        gameFiles.forEach((gf, i) => {
            mpGames.push({
                key: ++i,
                description: gf.name
            });
        });

        mp.addMenu({
            title: "CLI-Games Collection by Sv443 - Choose a game",
            options: mpGames
        });

        mp.open();
    }
    catch(err)
    {
        console.log(`${col.red}Error while scanning for games:${col.rst} ${err}\n`);
        jsl.pause().then(() => process.exit(1));
    }
}

/**
 * Returns all game's files
 * @returns {GameFiles}
 */
function getGameFiles()
{
    let retObj = {
        win: [],
        mac: [],
        linux: []
    };

    fs.readdirSync("./games/").forEach(game => {
        fs.readdirSync(`./games/${game}`).forEach(gameFile => {
            let gameFileOrig = gameFile;
            gameFile = gameFile.toLowerCase();

            let pushTo = "";

            if(gameFile.includes("win") || gameFile.endsWith(".exe"))
                pushTo = "win";
            else if(gameFile.includes("macos"))
                pushTo = "mac";
            else if(gameFile.includes("linux"))
                pushTo = "linux";
            else return;
            
            retObj[pushTo].push({
                name: game,
                path: `./games/${game}/${gameFileOrig}`,
                dir: `./games/${game}`
            });
        });
    });

    return retObj;
}

/**
 * Executes a file
 * @param {String} path 
 * @param {String} cwd
 */
function execFile(path, cwd)
{
    let cp = childProcess.spawn(resolve(path), [process.argv[0], cwd], {
        detached: false,
        stdio: "inherit",
        cwd: cwd
    });

    cp.on("exit", (code) => {
        if(code == 1)
        {
            console.log(`${col.red}Error while playing game${col.rst}\n`);
            jsl.pause().then(() => process.exit(1));
        }
        else init();
    });
}

/**
 * Returns the current OS
 * @returns {"win"|"mac"|"linux"}
 */
function getOS()
{
    if(process.platform.match(/darwin/g))
        return "mac";
    else if(process.platform.match(/win/g))
        return "win";
    else if(process.platform.match(/linux/g))
        return "linux";
}

initAll();
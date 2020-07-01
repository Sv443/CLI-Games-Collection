const fs = require("fs-extra");

try
{
    console.log("\nPreparing to move files...");

    const gamesDir = "./games/";
    const moveMap = [
        {
            from: "./Node-Hangman/build",
            name: "Node-Hangman"
        },
        {
            from: "./Conways-CLIfe/dist",
            name: "Conways-CLIfe"
        }
    ];

    fs.ensureDirSync(gamesDir);

    moveMap.forEach(itm => {
        console.log(`Moving ${itm.name}...`);
        fs.copySync(itm.from, `${gamesDir}${itm.name}`, { errorOnExist: false, overwrite: true });
    });

    console.log("\nDone.\n\n");
    process.exit(0);
}
catch(err)
{
    console.log(`Error: ${err}`);
    process.exit(1);
}
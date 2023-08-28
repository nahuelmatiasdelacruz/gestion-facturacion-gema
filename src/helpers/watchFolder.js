const fs = require('fs');
const chokidar = require("chokidar");
const path = require('path');
const axios = require('axios');

const folder = path.join(__dirname, "..","..","..","ops_uploads","GEMA");
console.log(folder);
const watchChangesFolder = () => {
    const watcher = chokidar.watch(folder,{ignoreInitial: true});
    watcher.on("add",(fileName)=>{
        console.log(`Se ha cargado el archivo: ${fileName}`);
        axios.get("http://139.144.191.36/BIGEN Facturas/05.php?dest=GEMA");
        console.log("Solicitud a la IA enviada.");
    })
}

module.exports = {
    watchChangesFolder
}
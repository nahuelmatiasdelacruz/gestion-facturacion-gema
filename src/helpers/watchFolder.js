const chokidar = require("chokidar");
const path = require('path');
const Facturasia = require("../models/db/Facturasia");

const folder = path.join(__dirname, "..","..","..","ops_uploads","GEMA");
const watchChangesFolder = () => {
    const watcher = chokidar.watch(folder,{ignoreInitial: true, awaitWriteFinish: true});
    watcher.on("add",async (fileName)=>{
        const pdfName = fileName.split("/var/www/html/ops_uploads/GEMA/")[1];
        try{
            const newDocument = new Facturasia({
                cuit: "no data",
                factura: "no data",
                remito: "no data",
                boca: "no data",
                fecha: "no data",
                origin: pdfName
            });
            await newDocument.save();
        }catch(e){
            console.log(e);
        }
    })
}

module.exports = {
    watchChangesFolder
}
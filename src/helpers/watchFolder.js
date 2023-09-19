const fs = require('fs');
const chokidar = require("chokidar");
const path = require('path');
const axios = require('axios');
const Facturasia = require("../models/db/Facturasia");

const folder = path.join(__dirname, "..","..","..","ops_uploads","GEMA");
console.log(folder);
const watchChangesFolder = () => {
    const watcher = chokidar.watch(folder,{ignoreInitial: true});
    watcher.on("add",async (fileName)=>{
        const pdfName = fileName.split("/var/www/html/ops_uploads/GEMA/")[1];
        console.log(`Se ha cargado el archivo: ${pdfName}`);
        //axios.get("http://139.144.191.36/BIGEN Facturas/05.php?dest=GEMA");
        try{
            const newDocument = new Facturasia({
                cuit: "",
                factura: "",
                remito: "",
                boca: "",
                fecha: "",
                origin: pdfName
            });
            await newDocument.save();
        }catch(e){
            console.log(e);
        }
        console.log("Solicitud a la IA enviada.");
    })
}

module.exports = {
    watchChangesFolder
}
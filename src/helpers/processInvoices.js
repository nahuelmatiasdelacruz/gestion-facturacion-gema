const Facturasia = require("../models/db/Facturasia");
const Invoice = require("../models/db/Invoice");
const fs = require("fs");
const path = require("path");
const failed_invoice = require("../models/db/Failed_inovice");

const processInvoice = async (invoiceData) => {
    if(invoiceData.operationType === "insert"){
        let fileName = invoiceData.fullDocument.origin;
        let invoice = {
            ...invoiceData.fullDocument,
            cuit: invoiceData.fullDocument.cuit || ""
        }
        fileName = await checkIfHasDoc(fileName);
        invoice = {
            ...invoice,
            origin: fileName
        }
        const origen = path.join(__dirname,"..","..","..","ops_uploads","GEMA",fileName);
        if(fs.existsSync(origen)){
            try{
                const pendingFolder = path.join(__dirname,"..","..","..","facturas_pendientes",invoice.origin);
                fs.renameSync(origen,pendingFolder);
                const parsedInvoice = {
                    ...invoice,
                    cuit: ""
                }
                const newFailedInvoice = new failed_invoice(parsedInvoice);
                await newFailedInvoice.save();
            }catch(e){
                console.log("Error al mover el archivo a carpeta de pendientes");
                console.log(e);
            }
        }else{
            console.log("2- El archivo no existe en la carpeta ops_uploads/GEMA. Se detiene el proceso");
        }
    }
}
const checkIfHasDoc = async (docName) => {
    const doc = await Facturasia.find({origin: docName});
    if(doc.length >= 1){
        const origen = path.join(__dirname,"..","..","..","ops_uploads","GEMA",docName);
        const newPath = path.join(__dirname,"..","..","..","ops_uploads","GEMA",`${Date.now()}.pdf`);
        fs.renameSync(origen,newPath);
        return `${Date.now()}.pdf`;
    }else{
        return docName;
    }
}

module.exports = {processInvoice};
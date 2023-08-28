const Facturasia = require("../models/db/Facturasia");
const Invoice = require("../models/db/Invoice");
const fs = require("fs");
const path = require("path");
const failed_invoice = require("../models/db/Failed_inovice");

const processInvoice = async (invoiceData) => {
    if(invoiceData.operationType === "insert"){
        const fileName = invoiceData.fullDocument.origin;
        const invoice = {
            ...invoiceData.fullDocument,
            cuit: parseInt(invoiceData.fullDocument.cuit.replace(/[^0-9]/g, ""))
        }
        console.log("Datos de la factura: ");
        console.log(invoice);
        const hasPrevFile = await checkIfHasDoc(fileName);
        console.log("Nombre del archivo: " + fileName);
        if(!hasPrevFile){
            const origen = path.join(__dirname,"..","..","..","ops_uploads","GEMA",fileName);
            console.log("Origen: ");
            console.log(origen);
            console.log("1- Verificando si existe el archivo en la carpeta ops_uploads/GEMA");
            if(fs.existsSync(origen)){
                console.log("2- El archivo existe, verificando si la IA envió los datos completos...");
                if(hasFullData(invoice)){
                    // Mover a procesados si tiene data completa y guardar en la base de facturas
                    console.log("3- La IA ha enviado los datos completos, moviendo el archivo a facturas_procesadas");
                    const clientFolder = path.join(__dirname,"..","..","..","facturas_procesadas",invoice.cuit.toString());
                    console.log("Client Folder: ");
                    console.log(clientFolder);
                    const destFolder = path.join(__dirname,"..","..","..","facturas_procesadas",invoice.cuit.toString(),invoice.origin);
                    console.log("Dest Folder: ");
                    console.log(destFolder);
                    if(!fs.existsSync(clientFolder)){
                        try{
                            fs.mkdirSync(clientFolder);
                            console.log("Se ha creado la carpeta del cliente correctamente");
                        }catch(e){
                            console.log(e);
                        }
                    }
                    try{
                        fs.renameSync(origen,destFolder);
                        const newInvoice = new Invoice({
                            remito: invoice.remito,
                            cuit: invoice.cuit,
                            numeroBoca: invoice.boca,
                            numeroImpreso: "",
                            date: invoice.fecha,
                            rendido: false,
                            rutaArchivo: invoice.origin,
                            checkId: "",
                            clientManager: null,
                        });
                        await newInvoice.save();
                    }catch(e){
                        console.log("Hubo un error al mover el archivo");
                        console.log(e);
                    }
                }else{
                    // Mover a pendientes si le faltan datos y guardar en la base de pendientes
                    console.log("3- La IA no ha completado todos los datos, moviendo el archivo a la carpeta: facturas_pendientes");
                    try{
                        const pendingFolder = path.join(__dirname,"..","..","..","facturas_pendientes",invoice.origin);
                        fs.renameSync(origen,pendingFolder);
                        const parsedInvoice = {
                            ...invoice,
                            cuit: isNaN(invoice.cuit) ? "" : invoice.cuit
                        }
                        const newFailedInvoice = new failed_invoice(parsedInvoice);
                        await newFailedInvoice.save();
                    }catch(e){
                        console.log("Error al mover el archivo a carpeta de pendientes");
                        console.log(e);
                    }
                }
            }else{
                console.log("2- El archivo no existe en la carpeta ops_uploads/GEMA. Se detiene el proceso");
            }
        }
    }
}
const checkIfHasDoc = async (docName) => {
    const doc = await Facturasia.find({origin: docName});
    if(doc.length > 1){
        return true;
    }else{
        return false;
    }
}
const hasFullData = (doc) => {
    console.log("Chequeando si tiene todos los datos: ");
    console.log(doc);
    if((doc.factura !== "" || doc.remito !== "") && (doc.cuit !== "" && !isNaN(doc.cuit))){
        console.log("Tiene (factura o remito), CUIT y fecha");
        return true;
    }else{
        console.log("Faltan datos");
        return false;
    }
}

module.exports = {processInvoice};
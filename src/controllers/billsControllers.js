const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const fs = require("fs");
const dayjs = require("dayjs");
const path = require("path");
const Invoice = require("../models/db/Invoice");
const failed_invoice = require("../models/db/Failed_inovice");
const checkedinvoice = require("../models/db/CheckedInvoice");
const Client = require("../models/db/Client");

// Helpers
const getRendicionNro = async () => {
    let rendicionNro;
    try {
        const lastCheck = await checkedinvoice.findOne(
            {},
            {},
            { sort: { rendicionNro: -1 }, limit: 1 }
        );
        if (lastCheck) {
            const lastParts = lastCheck.rendicionNro.split("-");
            let newPart2 = parseInt(lastParts[1]) + 1;
            if (newPart2 > 999999) {
                newPart2 = 1;
                lastParts[0] = (parseInt(lastParts[0]) + 1)
                    .toString()
                    .padStart(4, "0");
            }
            rendicionNro = `${lastParts[0]}-${newPart2.toString().padStart(6, "0")}`;
        } else {
            rendicionNro = "0001-000001"; // Primer checkId
        }
        return rendicionNro;
    } catch (e) {
        console.log(e);
        return "0001-000001";
    }
};

// Requests
const getBills = async (req, res) => {
    let query = {};
    if (req.usuario.role === "CLIENT_USER") {
        query = {
            cuit: req.usuario.cuit,
        };
    }
    // }else if(req.usuario.role === "CLIENT_ADMIN"){
    //     query = {
    //         clientManager: req.usuario._id
    //     }
    // }
    try {
        const data = await Invoice.find(query);
        const parsed = data.map((invoice) => {
            return {
                ...invoice._doc,
                id: invoice._doc._id.toString(),
            };
        });
        const clientsWithCuits = await Promise.all(
            parsed.map(async (client) => {
                const clientName = await Client.findOne({ cuit: client.cuit });
                return {
                    ...client,
                    cliente: clientName?.name || "",
                };
            })
        );
        res.json(clientsWithCuits);
    } catch (e) {
        console.log(e.message);
        res.status(500).json({ msg: "Error al buscar facturas" });
    }
};
const getBillById = async (req, res) => {};
const getPending = async (req, res) => {
    try {
        const data = await failed_invoice.find({});
        const parsed = data.map((invoice) => {
            return {
                id: invoice._id,
                boca: invoice.boca,
                cuit: invoice.cuit,
                factura: invoice.factura,
                fecha: invoice.fecha,
                origin: invoice.origin,
                remito: invoice.remito,
            };
        });
        res.json(parsed);
    } catch (e) {
        console.log(e.message);
        res.status(500).json({
            msg: "Hubo un error al buscar la cantidad de facturas pendientes",
        });
    }
};
const addBill = async (req, res) => {};
const updateBill = async (req, res) => {
    const { date, remito, numeroBoca, cuit, id } = req.body;
    try{
        const currentInvoice = await Invoice.findById(new ObjectId(id));
        const prevCuit = currentInvoice.cuit;
        const nextCuit = parseInt(cuit);
        if(prevCuit !== nextCuit){
            const prevPath = path.join(__dirname,"..","..","..","facturas_procesadas",prevCuit.toString(),currentInvoice.rutaArchivo);
            const nextPath = path.join(__dirname,"..","..","..","facturas_procesadas",nextCuit.toString());
            const nextPathWithFileName = path.join(__dirname,"..","..","..","facturas_procesadas",nextCuit.toString(),currentInvoice.rutaArchivo)
            if (!fs.existsSync(nextPath)) {
                try {
                    fs.mkdirSync(nextPath);
                } catch (e) {
                    console.log(e);
                }
            }
            try{
                fs.renameSync(prevPath,nextPathWithFileName);
            }catch(e){

            }
        }
    }catch(e){
        console.log(e);
    }
    try {
        await Invoice.findByIdAndUpdate(new ObjectId(id), {
            remito,
            numeroBoca,
            cuit,
            date,
        });
        return res.status(200).json({ msg: "Factura actualizada con éxito" });
    } catch (e) {
        console.log(e.message);
        return res
            .status(500)
            .json({ msg: "Hubo un error al actualizar la factura" });
    }
    res.json({});
};
const deleteBill = async (req, res) => {
    const { id } = req.params;
    try {
        const doc = await Invoice.findById(new ObjectId(id));
        try {
            const filePath = path.join(
                __dirname,
                "..",
                "..",
                "..",
                "facturas_procesadas",
                doc.cuit,
                doc.rutaArchivo
            );
            fs.unlinkSync(filePath);
        } catch (e) {
            console.log(e.message);
        }
        await Invoice.findByIdAndDelete(new ObjectId(id));
        return res.status(200).json({ msg: "Archivo eliminado correctamente" });
    } catch (e) {
        console.log(e.message);
        return res.status(500).json({ msg: "Error al eliminar el archivo" });
    }
};
const editarPendiente = async (req, res) => {
    const invoiceData = req.body;
    try {
        const doc = await failed_invoice.findById(new ObjectId(invoiceData.id));
        const rutaOrigen = path.join(
            __dirname,
            "..",
            "..",
            "..",
            "facturas_pendientes",
            doc.origin
        );
        const newClientFolderPath = path.join(
            __dirname,
            "..",
            "..",
            "..",
            "facturas_procesadas",
            invoiceData.cuit.toString()
        );
        const rutaDestino = path.join(
            __dirname,
            "..",
            "..",
            "..",
            "facturas_procesadas",
            invoiceData.cuit.toString(),
            doc.origin
        );
        if (!fs.existsSync(newClientFolderPath)) {
            try {
                fs.mkdirSync(newClientFolderPath);
            } catch (e) {
                console.log(e);
            }
        }
        fs.renameSync(rutaOrigen, rutaDestino);
        await failed_invoice.findByIdAndDelete(new ObjectId(invoiceData.id));
        const newInvoice = new Invoice({
            remito: invoiceData.remito,
            cuit: invoiceData.cuit,
            numeroBoca: invoiceData.numeroBoca,
            numeroImpreso: "",
            date: invoiceData.fecha,
            rendido: false,
            rutaArchivo: doc.origin,
            checkId: "",
            clientManager: null,
        });
        await newInvoice.save();
        res.json({});
    } catch (e) {
        console.log(e);
        res.status(500).json({
            msg: "Hubo un error al editar la factura pendiente",
        });
    }
};
const deletePending = async (req, res) => {
    const { id } = req.params;
    try {
        const doc = await failed_invoice.findById(new ObjectId(id));
        const rutaArchivoEliminar = path.join(
            __dirname,
            "..",
            "..",
            "..",
            "facturas_pendientes",
            doc.origin
        );
        fs.unlinkSync(rutaArchivoEliminar);
        await failed_invoice.findByIdAndDelete(new ObjectId(id));
        return res
            .status(200)
            .json({ msg: "Se ha eliminado el remito correctamente" });
    } catch (e) {
        console.log(e);
        return res
            .status(200)
            .json({ msg: "Hubo un error al eliminar el remito" });
    }
};
const downloadFailed = async (req, res) => {
    try {
        const { id } = req.params;
        const failedInvoice = await failed_invoice.findById(new ObjectId(id));
        const filePath = path.join(
            __dirname,
            "..",
            "..",
            "..",
            "facturas_pendientes",
            failedInvoice.origin
        );
        res.download(filePath, failedInvoice.origin, (err) => {
            if (err) {
                console.log(err);
                return res
                    .status(500)
                    .json({ msg: "Hubo un error al descargar el archivo" });
            }
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            msg: "Hubo un error en el servidor al buscar el PDF",
        });
    }
};
const downloadBill = async (req, res) => {
    const { id } = req.params;
    const invoice = await Invoice.findById(new ObjectId(id));
    let filePath = "";
    if (invoice.cuit) {
        filePath = path.join(
            __dirname,
            "..",
            "..",
            "..",
            "facturas_procesadas",
            invoice.cuit.toString(),
            invoice.rutaArchivo
        );
    } else {
        filePath = path.join(
            __dirname,
            "..",
            "..",
            "..",
            "facturas_pendientes",
            invoice.rutaArchivo
        );
    }
    res.download(filePath, invoice.rutaArchivo,(e)=>{
        if(e){
            const directorio = path.join(__dirname,"..","..","..","facturas_procesadas");
            fs.readdir(directorio,(e,archivos)=>{
                const foundFile = false;
                if(e){
                    console.log("HUBO UN ERROR DENTRO DE LA LECTURA DEL DIRECTORIO");
                    return;
                }
                archivos.forEach((folderName)=>{
                    const filePath = path.join(__dirname,"..","..","..","facturas_procesadas",folderName);
                    const fileToCheck = path.join(filePath,invoice.rutaArchivo);
                    fs.access(fileToCheck,fs.constants.F_OK,(err)=>{
                        if(!err){
                            console.log("Se encontró el archivo en la carpeta: " + filePath);
                            console.log("Nombre del archivo: " + invoice.rutaArchivo);
                            const newPath = path.join(__dirname,"..","..","..","facturas_procesadas",invoice.cuit.toString(),invoice.rutaArchivo);
                            fs.renameSync(fileToCheck,newPath);
                            console.log("Se ha movido el archivo con éxito");
                        }
                    })
                });
            })
        }
    });
};
const startCheck = async (req, res) => {
    let pdfData = {};
    const invoices = req.body;
    const invoicesCheck = await Promise.all(
        invoices.map(async (invoice) => {
            const inv = await Invoice.findById(new ObjectId(invoice));
            return inv;
        })
    );

    // Chequeo si todos los CUITS son iguales
    const cuitReference = invoicesCheck[0].cuit;
    const hasDiferentCuit = invoicesCheck.some(
        (invoice) => invoice.cuit !== cuitReference
    );
    if (hasDiferentCuit) {
        return res.status(401).json({msg: "Las facturas que seleccione deben ser del mismo cliente",});
    }

    // Chequeo si alguna de las facturas ya fue chequeada previamente
    for (const invoice of invoicesCheck) {
        if (invoice.rendido) {
            return res.status(401).json({msg: "Seleccione facturas que no hayan sido chequeadas previamente"});
        }
    }
    const client = await Client.findOne({cuit:invoicesCheck[0].cuit},"name");
    const parsedInvoices = invoicesCheck.map((invoice, index) => {
        return {
            id: invoice._id,
            number: index + 1,
            date: invoice.date,
            nroRemito: invoice.remito,
        };
    });
    const rendicionNro = await getRendicionNro();
    pdfData = {
        client: client.name,
        rendicionNro,
        date: dayjs().format("DD-MM-YYYY"),
        invoices: parsedInvoices,
    };
    return res.json(pdfData);
};
const checkBills = async (req, res) => {
    try{
        const pdfData = req.body;
        const parsedInvoices = pdfData.invoices.map((invoice) => {
            return invoice.id;
        });
        const pdfParsed = {
            ...pdfData,
            invoices: parsedInvoices,
        };
        const newCheck = new checkedinvoice(pdfParsed);
        await newCheck.save();
        await changeCheckStatusOnInvoices(parsedInvoices,pdfData.rendicionNro);
        return res.json({ msg: "ok" });
    }catch(e){
        return res.status(500).json({msg: `Hubo un error: ${e.message}`});
    }
};
const changeCheckStatusOnInvoices = async (invoices, checkId) => {
    try{
        await Promise.all(invoices.map(async (invoice)=>{
            await Invoice.findByIdAndUpdate(new ObjectId(invoice),{
                rendido: true,
                checkId
            })
        }));
    }catch(e){
        return 
    }
}
module.exports = billsControllers = {
    editarPendiente,
    startCheck,
    checkBills,
    downloadFailed,
    deletePending,
    getPending,
    downloadBill,
    getBills,
    getBillById,
    addBill,
    deleteBill,
    updateBill,
};
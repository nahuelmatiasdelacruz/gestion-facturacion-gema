const {Schema, model} = require("mongoose");

const InvoiceSchema = Schema({
    remito: {type: String},
    cuit: {type: Number},
    numeroBoca: {type: String},
    numeroImpreso: {type: String},
    date: {type: String},
    rendido: {type: Boolean, default: false},
    rutaArchivo: {type: String},
    checkId: {type: String},
    clientManager: {type: Schema.Types.ObjectId, ref: "Client"}
})

module.exports = model("Invoice",InvoiceSchema);
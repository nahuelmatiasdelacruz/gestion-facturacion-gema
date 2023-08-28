const {Schema,model} = require("mongoose");

const ReportSchema = Schema({
    id: {type: Number},
    caratula: {}
})

module.exports = model("Report",ReportSchema);

const legajo = {
    remito: [1,2], // Los PDF
    factura: [1,2], // Los PDF
    bonoRecepcion: String, // PDF
}
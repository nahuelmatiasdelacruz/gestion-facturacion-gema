const {model,Schema} = require("mongoose");

const FailedSchema = new Schema({
    cuit: {type: Number},
    factura: {type: String},
    remito: {type: String},
    boca: {type: String},
    fecha: {type: String},
    origin: {type: String}
})

module.exports = model("failed_invoice",FailedSchema);
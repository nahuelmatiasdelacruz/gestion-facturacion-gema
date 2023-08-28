const {model,Schema} = require("mongoose");

const facturaSchema = new Schema({
    cuit: {type: String},
    factura: {type: String},
    remito: {type: String},
    origin: {type: String},
    boca: {type: String},
    fecha: {type: String}
});

module.exports = model("Facturasia",facturaSchema);
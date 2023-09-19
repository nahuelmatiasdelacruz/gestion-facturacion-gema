const {model,Schema} = require("mongoose");

const facturaSchema = new Schema({
    cuit: {
      type: String,
      required: true,
    },
    factura: {
      type: String,
      required: true,
    },
    remito: {
      type: String,
      required: true,
    },
    boca: {
      type: String,
      required: true,
    },
    fecha: {
      type: String,
      required: true,
    },
    origin: {
      type: String,
      required: true,
    },
});

module.exports = model("Facturasia",facturaSchema);
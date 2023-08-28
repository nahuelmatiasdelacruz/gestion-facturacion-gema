const {Schema,model} = require("mongoose");

const LegajoSchema = Schema({
    remitos: {type: Array},
    facturas: {type: Array},
    bonoRecepcion: {type: Array},
})

module.exports = model("Legajo",LegajoSchema);
const {Schema, model} = require("mongoose");

const ClientSchema = Schema({
    name: {type: String, required: [true, "El nombre es requerido"]},
    logo: {type: String},
    cuit: {type: Number, required: [true, "El CUIT es requerido"]},
    phone: {type: Number},
    mail: {type: String},
    user: {type: String},
    password: {type: String},
    clientManager: {type: Schema.Types.ObjectId, ref: "Client"},
    role: {type: String, required: [true, "El rol del usuario es requerido"]},
    state: {type: Boolean, default: true}
})

module.exports = model("Client",ClientSchema);

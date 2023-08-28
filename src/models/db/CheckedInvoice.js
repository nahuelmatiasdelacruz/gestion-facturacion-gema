const mongoose = require('mongoose');
const {Schema,model} = require("mongoose");

const CheckedInvoiceSchema = Schema({
    rendicionNro: {type: String, required: true},
    client: {type: String, required: true},
    date: {type: String, required: true},
    invoices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice'
      }]
});
  
module.exports = model('checkedinvoice', CheckedInvoiceSchema);
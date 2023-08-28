const mongoose = require("mongoose");
const dbConnection = async () => {
    try{
        await mongoose.connect(process.env.MONGODBACCESS,{
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log("Conectado a la base de datos");
    }catch(e){
        console.log("Hubo un error al conectar a la base de datos: ");
        console.log(e.message);
    }
}

module.exports = {dbConnection};
const Client = require("../models/db/Client");
const bcryptjs = require("bcryptjs");
const {generateJwt} = require("../helpers/generarJwt");

const login = async (req,res) => {
    const {user,password} = req.body;
    try{
        const foundUser = await Client.findOne({user,password});
        console.log(foundUser);
        if(!foundUser){
            console.log("No se encontró usuario");
            return res.status(400).json({msg: "Usuario o contraseña incorrectos"});
        }
        if(!foundUser.state){
            console.log("Usuario deshabilitado");
            return res.status(400).json({msg: "El usuario se encuentra deshabilitado"});
        }
        //const validPassword = bcryptjs.compareSync(password,foundUser.password);
        //if(!validPassword){
        //    console.log("Contraseña incorrecta");
        //    console.log({
        //        user,
        //        password,
        //    });
        //    return res.status(400).json({success: false, message: "Usuario o contraseña incorrectos"});
        //}
        const token = await generateJwt(foundUser.id);
        res.json({token, foundUser});
    }catch(e){
        console.log(e);
        console.log("Hubo un error: " + e.message);
        return res.status(500).json({success: false, message: "Algo salió mal en el servidor"});
    }
}

module.exports = {login};
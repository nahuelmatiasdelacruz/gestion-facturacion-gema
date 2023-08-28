const jwt = require('jsonwebtoken');
const Client = require("../models/db/Client");

const validarJwt = async (req,res,next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.status(401).json({
            msg: "No hay token en la petición"
        })
    }
    try{
        const {uid} = jwt.verify(token,process.env.JWTPRIVATEKEY);
        const user = await Client.findById(uid);
        if(!user){
            return res.status(401).json({
                msg: "El usuario no existe en la db"
            });
        }
        if(!user.state){
            return res.status(401).json({
                msg: "El usuario está deshabilitado"
            });
        }
        req.usuario = user;
        next();
    }catch(e){
        console.log(e.message);
        res.status(401).json({
            msg: "Token no valido"
        })
    }
}

module.exports = {validarJwt}
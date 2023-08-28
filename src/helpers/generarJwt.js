const jwt = require("jsonwebtoken");

const generateJwt = (uid) => {
    return new Promise((res,rej)=>{
        const payload = {uid};
        jwt.sign(payload,process.env.JWTPRIVATEKEY,(err,token)=>{
            if(err){
                console.log("No se pudo generar el token: " + err)
                rej("No se pudo generar el token");
            }else{
                res(token);
            }
        });
    });
}

module.exports = {generateJwt};
const {dbConnection} = require("../config/dbConfig");
const cors = require("cors");
const express = require("express");
const path = require("path");
const Facturasia = require("./db/Facturasia");
const bodyParser = require("body-parser");
const { processInvoice } = require("../helpers/processInvoices");
const { watchChangesFolder } = require("../helpers/watchFolder");

class Server{
    constructor(){
        this.apiPaths = {
            auth: "/api/auth",
            bills: "/api/bills",
            clients: "/api/clients",
        }
        this.app = express();
        this.port = process.env.PORT || 8080;
        this.conectarDb();
        this.middlewares();
        this.routes();
        this.watchChanges();
    }
    async conectarDb(){
        await dbConnection();
    }
    watchChanges(){
        Facturasia.watch()
            .on("change",(data)=>{
                console.log("La IA ha insertado un documento en la base de datos: ");
                processInvoice(data);
            });
        watchChangesFolder();
    }
    middlewares(){
        this.app.use(bodyParser.json({limit: "500kb"}));
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static(path.resolve(__dirname,"../client/build")));
    }
    routes(){
        this.app.use(this.apiPaths.auth,require("../routes/auth"));
        this.app.use(this.apiPaths.bills,require("../routes/bills"));
        this.app.use(this.apiPaths.clients,require("../routes/clients"));
    }
    listen(){
        this.app.listen(this.port,()=>{
            console.log("Server Facturas ON! - Port: " + this.port);
        })
    }
}

module.exports = Server;
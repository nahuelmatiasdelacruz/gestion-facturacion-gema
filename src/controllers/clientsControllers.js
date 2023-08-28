const Client = require("../models/db/Client");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const setProfilePhoto = async (req,res) => {
    const {_id} = req.usuario;
    const role = await Client.findById(_id);
    if(role!=="CLIENT_ADMIN" || role!=="SUPER_ADMIN"){
        return res.status(401).json({msg: "No tiene permiso para realizar esta acción"});
    }
    try{
        await Client.findByIdAndUpdate(_id,{
            photo: req.body.newPhoto
        });
        res.status(200).json({msg: "Se cambio correctamente la foto"});
    }catch(e){
        console.log(e.message);
        res.status(500).json({msg: "Hubo un error al cambiar el logo"});
    }
}
const getPhotoById = async (req,res) => {
    try{
        const {_id} = req.usuario;
        const newPhoto = await Client.findOne({_id});
        res.json(newPhoto.logo);
    }catch(e){
        res.status(400).json({msg: "error" , error: e.message});
    }
}
const getClients = async (req,res)=>{
    const id = req.usuario._id;
    let query = {};
    if(req.usuario.role==="CLIENT_ADMIN"){
        query = {
            clientManager: id,
            _id: {$ne: id}
        }
    }
    try{
        const clients = await Client.find(query);
        const parsed = clients.map(client=>{
            const clientData = {
                id: client._id,
                name: client.name,
                cuit: client.cuit,
                user: client.user,
                mail: client.mail,
                phone: client.phone
            }
            return clientData;
        })
        res.json(parsed);
    }catch(e){
        console.log(e.message);
        res.status(500).json({msg: "Hubo un error al buscar los clientes"});
    }
}
const getClientCuits = async (req, res) => {
    try{
        const clients = await Client.find({});
        const parsed = clients.map(client=>{
            const clientData = {
                label: client.name,
                cuit: client.cuit
            }
            return clientData;
        })
        res.json(parsed);
    }catch(e){
        console.log(e);
        res.status(500).json({msg: "Hubo un error al buscar los clientes"});
    }
}
const getClientById = async (req,res) => {
    try{
        const {_id} = req.usuario;
        const data = await Client.findOne({_id});
        const dataToClient = {
            cuit: data.cuit,
            logo: data.logo,
            mail: data.mail,
            name: data.name,
            phone: data.phone,
            user: data.user,
        }
        res.json(dataToClient);
    }catch(e){
        console.log(e.message);
        res.status(400).json({msg: "Error", error: e.message});
    }
}
const addClient = async (req,res)=>{
    const id = req.usuario._id;
    const userRole = req.usuario.role;
    const data = req.body;
    try{
        const newClient = new Client({
            name: data.name,
            logo: req.usuario.logo,
            cuit: data.cuit,
            phone: data.phone,
            mail: data.mail,
            user: data.user,
            role: userRole === "SUPER_ADMIN" ? "CLIENT_ADMIN" : "CLIENT_USER",
            clientManager: id,
            password: data.password,
        })
        newClient.save();
    }catch(e){
        res.status(500).json({msg: "Hubo un error al agregar el cliente"});
    }
    res.status(200).json({msg: "Client added"});
}
const updateClient = async (req,res)=>{
    const id = new ObjectId(req.body.id);
    try{
        await Client.findByIdAndUpdate(id,{
            name: req.body.name,
            cuit: req.body.cuit,
            user: req.body.user,
            mail: req.body.mail,
            phone: req.body.phone,
            password: req.body.password
        })
        return res.status(200).json({msg: "Cliente actualizado"});
    }catch(e){
        return res.status(500).json({msg: "Hubo un error al actualizar el cliente"});
    }
}
const updatePhoto = async (req,res) => {
    const {foto,clientId} = req.body;
    try{
        await Client.findByIdAndUpdate(new ObjectId(clientId),{
            logo: foto
        });
        res.status(200).json({msg: "Foto cambiada con exito"});
    }catch(e){
        console.log(e.message);
        res.status(400).json({msg: "No se pudo cambiar la foto", error: e.message});
    }
}
const deleteClient = async (req,res)=>{
    const {id} = req.params;
    try{
        await Client.findByIdAndDelete(new ObjectId(id));
        res.status(200).json({msg: "Se ha borrado el cliente"});
    }catch(e){
        console.log(e.message);
        res.status(500).json({msg: "Hubo un error al borrar el cliente"});
    }
}
const checkRole = async (req, res)=>{
    try{
        const data = await Client.findById(req.usuario._id);
        const role = data.role;
        res.json(role);
    }catch(e){
        console.log(e.message);
        res.status(500).json({msg: "Hubo un error al buscar el rol"});
    }
}
module.exports = clientsControllers = {
    getClients,
    getClientCuits,
    checkRole,
    setProfilePhoto,
    getPhotoById,
    updatePhoto,
    getClientById,
    addClient,
    deleteClient,
    updateClient
}
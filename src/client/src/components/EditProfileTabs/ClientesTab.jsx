import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import Modal from "@mui/material/Modal";
import Button from '@mui/material/Button';
import { DataGrid, esES } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import Stack from '@mui/material/Stack';
import axios from 'axios';
import { server, stylesModal } from '../../helpers/constants';
import { Toaster, toast } from 'react-hot-toast';

const ClientesTab = () => {
    const [clientes,setClientes] = useState([]);
    const [selected,setSelected] = useState({});
    const [modalAdd,setModalAdd] = useState(false);
    const [modalEdit,setModalEdit] = useState(false);
    const [modalDelete,setModalDelete] = useState(false);
    const [newClientData,setNewClientData] = useState({});
    const [loading,setLoading] = useState(false);
    const gridColumns = [
        {field: "cuit", headerName: "CUIT", width: 200},
        {field: "name", headerName: "Razon social", width: 200},
        {field: "email", headerName: "Email", width: 240},
        {field: "user", headerName: "Usuario", width: 200},
        {field: "actions",disableColumnMenu: true,disableColumnFilter: true,disableColumnSelector: true,headerName: "Acciones",sortable: false,width: 130,renderCell: (params)=>{
            return(
                <Stack direction="row" spacing={1}>
                    <IconButton onClick={()=>{startEditClient(params.row)}} color="success" aria-label="edit">
                        <EditIcon/>
                    </IconButton>
                    <IconButton onClick={()=>{startDeleteClient(params.row)}} color="error" aria-label="delete">
                        <DeleteIcon/>
                    </IconButton>
                </Stack>
            )
        }},
    ]
    const getClientes = async () => {
        setLoading(true);
        try{
            const token = sessionStorage.getItem("x-token");
            const result = await axios.get(`${server}/api/clients`,{
                headers: {
                    Authorization: `Bearer ${token}` 
                }
            });
            setClientes(result.data);
            setLoading(false);
        }catch(e){
            console.log(e.message);
            setLoading(false);
        }
        setLoading(false);
    }
    const startAddClient = () => {
        setModalAdd(true);
    }
    const handleCloseAdd = () => {
        setNewClientData({});
        setModalAdd(false);
    }
    const startEditClient = (e) => {
        setSelected(e)
        setModalEdit(true);
    }
    const handleCloseEdit = () => {
        setModalEdit(false);
    }
    const startDeleteClient = (e) => {
        setSelected(e)
        setModalDelete(true);
    }
    const handleCloseDelete = () => {
        setModalDelete(false);
    }
    const handleChangeCuit = (e) => {
        setNewClientData({
            ...newClientData,
            cuit: e.target.value
        });
    }
    const handleChangeEditName = (e) => {
        setSelected({
            ...selected,
            name: e.target.value
        })
    }
    const handleChangeEditCuit = (e) => {
        setSelected({
            ...selected,
            cuit: e.target.value
        })
    }
    const handleChangeEditPassword = (e) => {
        setSelected({
            ...selected,
            password: e.target.value
        })
    }
    const handleChangeEditUser = (e) => {
        setSelected({
            ...selected,
            user: e.target.value
        })
    }
    const handleChangeEditMail = (e) => {
        setSelected({
            ...selected,
            mail: e.target.value
        })
    }
    const handleChangeEditPhone = (e) => {
        setSelected({
            ...selected,
            phone: e.target.value
        })
    }
    const confirmarEdicion = async () => {
        const token = sessionStorage.getItem('x-token');
        if(!selected.name || !selected.cuit || !selected.user){
            return console.log("Por favor, complete todos los campos");
        }
        try{
            await axios.put(`${server}/api/clients`,selected,
            {
                headers: {
                  Authorization: `Bearer ${token}`
                }
            });
            await getClientes();
            handleCloseEdit();
            setSelected({});
        }catch(e){
            console.log(e);
            toast.error(`Hubo un error al borrar el cliente: ${e.message}`);
        }
    }
    const confirmarBorrado = async () => {
        try{
            const token = sessionStorage.getItem('x-token');
            console.log(selected);
            await axios.delete(`${server}/api/clients/${selected.id}`,{
                headers:{
                    Authorization: `Bearer ${token}`
                }
            });
            await getClientes();
            handleCloseDelete();
            setSelected({});
        }catch(e){
            toast.error(`Hubo un error al borrar el cliente: \n${e.message}`);
            setSelected({});
            handleCloseDelete();
        }
    }
    const confirmarNuevoCliente = async () => {
        if(!newClientData.name || !newClientData.cuit || !newClientData.user || !newClientData.password){
            return toast.error("Debe completar todos los campos");
        }
        setLoading(true);
        try{
            const token = sessionStorage.getItem('x-token');
            await axios.post(`${server}/api/clients`,newClientData,{headers: {Authorization: `Bearer ${token}`}});
            await getClientes();
            setNewClientData({});
            setModalAdd(false);
            setLoading(false);
        }catch(e){
            console.log(e);
            toast.error(`Ocurrió un error al agregar el cliente: ${e.message}`);
        }
    }
    const handleChangeUser = (e) => {
        setNewClientData({
            ...newClientData,
            user: e.target.value
        });
    }
    const handleChangePassword = (e) => {
        setNewClientData({
            ...newClientData,
            password: e.target.value
        });
    }
    const handleChangeName = (e) => {
        setNewClientData({
            ...newClientData,
            name: e.target.value
        });
    }
    const handleChangePhone = (e) => {
        setNewClientData({
            ...newClientData,
            phone: e.target.value
        });
    }
    const handleChangeMail = (e) => {
        setNewClientData({
            ...newClientData,
            mail: e.target.value
        });
    }
    useEffect(()=>{
        getClientes();
    },[])
    return(
        <Box sx={{height: "60vh"}}>
            <Toaster/>
            {/* Modal Agregar */}
            <Modal open={modalAdd} onClose={handleCloseAdd} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <Box sx={stylesModal}>
                    <h4 className="title-helper">Añadir un nuevo cliente asociado al usuario</h4>
                    <Box sx={{marginBottom: 2, marginTop: 2}}>
                        <TextField value={newClientData?.name} onChange={handleChangeName} label="Nombre / Razon Social" size="small"/>
                    </Box>
                    <Box sx={{marginBottom: 2}}>
                        <TextField type="number" value={newClientData?.cuit} onChange={handleChangeCuit} label="CUIT" size="small"/>
                    </Box>
                    <Box sx={{marginBottom: 2}}>
                        <TextField type="phone" value={newClientData?.phone} onChange={handleChangePhone} label="Teléfono" size="small"/>
                    </Box>
                    <Box sx={{marginBottom: 4}}>
                        <TextField type="mail" value={newClientData?.mail} onChange={handleChangeMail} label="Email" size="small"/>
                    </Box>
                    <Box sx={{marginBottom: 2}}>
                        <TextField type="string" value={newClientData?.user} onChange={handleChangeUser} label="Usuario" size="small"/>
                    </Box>
                    <Box sx={{marginBottom: 1}}>
                        <TextField type="password" value={newClientData?.password} onChange={handleChangePassword} label="Password" size="small"/>
                    </Box>
                    <Stack direction="row" spacing={5} marginTop="30px" justifyContent="center">
                        <Button onClick={confirmarNuevoCliente} variant="outlined" color="success">Confirmar</Button>
                        <Button onClick={handleCloseAdd} variant="outlined" color="error">Cancelar</Button>
                    </Stack>
                </Box>
            </Modal>
            {/* Modal Editar */}
            <Modal open={modalEdit} onClose={handleCloseEdit}>
                <Box sx={stylesModal}>
                    <h4 className="title-helper">Editar el cliente</h4>
                    <Box sx={{marginBottom: 2, marginTop: 2}}>
                        <TextField value={selected?.name} onChange={handleChangeEditName} label="Nombre / Razon Social" size="small"/>
                    </Box>
                    <Box sx={{marginBottom: 2}}>
                        <TextField type="number" value={selected?.cuit} onChange={handleChangeEditCuit} label="CUIT" size="small"/>
                    </Box>
                    <Box sx={{marginBottom: 2}}>
                        <TextField type="phone" value={selected?.phone} onChange={handleChangeEditPhone} label="Teléfono" size="small"/>
                    </Box>
                    <Box sx={{marginBottom: 4}}>
                        <TextField type="mail" value={selected?.mail} onChange={handleChangeEditMail} label="Email" size="small"/>
                    </Box>
                    <Box sx={{marginBottom: 2}}>
                        <TextField type="string" value={selected?.user} onChange={handleChangeEditUser} label="Usuario" size="small"/>
                    </Box>
                    <Box sx={{marginBottom: 4}}>
                        <TextField type="password" value={selected?.password} onChange={handleChangeEditPassword} label="Password" size="small"/>
                    </Box>
                    <Stack direction="row" spacing={5}>
                        <Button onClick={confirmarEdicion} variant="outlined" color="success">Confirmar cambios</Button>
                        <Button onClick={handleCloseEdit} variant="outlined" color="error">Cancelar</Button>
                    </Stack>
                </Box>
            </Modal>
            {/* Modal Editar */}
            <Modal open={modalDelete} onClose={handleCloseDelete}>
                <Box sx={stylesModal}>
                    <h4 className="title-helper">¿Está seguro que desea borrar el cliente seleccionado?</h4>
                    <h4 style={{marginBottom: 40, marginTop: 2}} className="title-helper"><span>{selected?.name}</span></h4>
                    <Stack direction="row" spacing={5}>
                        <Button onClick={confirmarBorrado} variant="outlined" color="success">Confirmar</Button>
                        <Button onClick={handleCloseDelete} variant="outlined" color="error">Cancelar</Button>
                    </Stack>
                </Box>
            </Modal>
            <DataGrid 
                disableRowSelectionOnClick={true} 
                loading={loading}
                rows={clientes} 
                columns={gridColumns} 
                autoPageSize
                rowHeight={43}
                sx={{height: "100%"}}
                localeText={esES.components.MuiDataGrid.defaultProps.localeText}
            />
            <Button onClick={startAddClient} sx={{marginTop: "20px"}} variant="outlined" startIcon={<AddIcon/>}>Agregar cliente</Button>
        </Box>
    )
}

export default ClientesTab;
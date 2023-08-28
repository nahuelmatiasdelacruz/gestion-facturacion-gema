import React, { useEffect, useRef, useState, useContext, createContext } from "react";
import loadingSpinner from "../img/LoadingGif.gif";
import logo from "../img/CompanyLogo.jpg";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-image-crop/dist/ReactCrop.css';
import ReactCrop from 'react-image-crop'

import { useNavigate} from "react-router-dom";

import PlaylistAddCheckCircleIcon from '@mui/icons-material/PlaylistAddCheckCircle';
import Divider from '@mui/material/Divider';
import Modal from "@mui/material/Modal";
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Badge from '@mui/material/Badge';
import Stack from '@mui/material/Stack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { stylesModal } from "../helpers/constants";
import { Autocomplete, Box, TextField } from "@mui/material";
import { DataGrid, esES } from '@mui/x-data-grid';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import TabsContainer from "./EditProfileTabs/TabsContainer";
import { server } from "../helpers/constants";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import Inventario from "./routes/Inventario";
import { getClientCuits, getPendingInvoices, getProfilePhoto, verifyRole } from "../helpers/componentHelpers";
import { confirmarBorrado, confirmarRemito } from "../helpers/mainHelpers";

const Main = ({isLoggedIn}) => {
    const navigate = useNavigate();
    const previewCanvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const [imagen,setImagen] = useState(null);
    const [openSupervisar,setOpenSupervisar] = useState(false);
    const [open,setOpen] = useState(false);
    const [openPendientes,setOpenPendientes] = useState(false);
    const [pendingInvoices,setPendingInvoices] = useState([]);
    const [photo,setPhoto] = useState(null);
    const [clientCuits,setClientCuits] = useState([]);
    const [role,setRole] = useState(null);
    const [image,setImage] = useState(null);
    const [sidePdf,setSidePdf] = useState(null);
    const [corte,setCorte] = useState(null);
    const [pendingCant,setPendingCant] = useState(0);
    const [openCrop,setOpenCrop] = useState(false);
    const [imagenRecortada,setImagenRecortada] = useState(null);
    const [openEdit,setOpenEdit] = useState(false);
    const [selected,setSelected] = useState({});
    const [openDelete,setOpenDelete] = useState(false);

    const pendingColumns = [
        {field: "cuit", headerName: "CUIT", width: 200},
        {field: "factura", headerName: "Factura",width: 200},
        {field: "remito", headerName: "Remito",width: 200},
        {field: "boca", headerName: "Boca",width: 200},
        {field: "fecha", headerName: "Fecha", width: 150},
        {field: "options", headerName: "Acciones", width: 300, renderCell: (params)=>{
            return (
                <Stack spacing={1} direction="row">
                  <IconButton onClick={(e)=>{vistaPrevia(e,params.row,true)}}>
                      <VisibilityIcon color="info"/>
                  </IconButton>
                    <IconButton onClick={(e)=>{startEdit(e,params.row)}} color="primary">
                        <EditIcon/>
                    </IconButton>
                    <IconButton onClick={(e)=>{startDelete(e,params.row)}} color="error">
                        <DeleteIcon/>
                    </IconButton>
                </Stack>
            )
        }}
    ];
    const vistaPrevia = async (e,data,failed) => {
        e.stopPropagation();
        const invoice = data;
        const token = sessionStorage.getItem("x-token");
        let failedString = "";
        if(failed) failedString = "failed/";
        try{
          const response = await axios.get(`${server}/api/bills/download/${failedString}${invoice.id}`,{
            responseType: "blob",
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          const url = URL.createObjectURL(response.data);
          window.open(url, "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=100,width=800,height=1000");
        }catch(e){
          console.log(e.message);
          toast.error("Error al abrir la vista previa del documento");
        }
      }
    const viewPdfOnSide = async (invoice) => {
        const token = sessionStorage.getItem("x-token");
        try{
          const response = await axios.get(`${server}/api/bills/download/failed/${invoice.id}`,{
            responseType: "blob",
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          const url = URL.createObjectURL(response.data);
          setSidePdf(url);
        }catch(e){
          console.log(e.message);
          toast.error("Error al abrir la vista previa del documento");
        }
    }
    const startEdit = (e,data) => {
        setSelected(data);
        viewPdfOnSide(data);
        setOpenEdit(true);
    }
    const startDelete = (e,data) => {
        setSelected(data);
        setOpenDelete(true);
    }
    const handleCloseEdit = () => {
        setOpenEdit(false);
        setSidePdf(null);
        setSelected({});
    }
    const handleCloseDelete = () =>{
        setOpenDelete(false);
        setSelected({});
    }
    const startEditProfile = () => {
        setOpen(true);
    }
    const managePendings = () => {
        setOpenPendientes(true);
    }
    const handleCloseEditar = () => {
        setSelected({});
        setOpen(false);
    }
    const startSupervisacion = () => {
        setOpenSupervisar(true);
    }
    const handleCloseSupervisar = () => {
        setImagenRecortada(null);
        setCorte(null);
        setImage(null);
        setOpenSupervisar(false);
    }
    const handleClickUpload = () => {
        fileInputRef.current.click();
    }
    const handleFileSelect = (e) => {
        if(e.target.files[0]){
            const file = e.target.files[0];
            setImage(URL.createObjectURL(file));
            setOpenCrop(true);
        }else{
            return;
        }
    }
    const handleCloseCrop = () => {
        setOpenCrop(false);
    }
    const handleImagenRecortada = () => {
        const imagenRef = document.createElement('img');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
    
        imagenRef.src = image;
        imagenRef.onload = () => {
          canvas.width = corte.width;
          canvas.height = corte.height;
    
          ctx.drawImage(
            imagenRef,
            corte.x,
            corte.y,
            corte.width,
            corte.height,
            0,
            0,
            corte.width,
            corte.height
          );
    
          const imagenBase64 = canvas.toDataURL('image/base64');
          setImagenRecortada(imagenBase64);
          setImagen(null);
          setOpenCrop(false);
        };
    };
    const handleClosePendientes = async () => {
        setOpenPendientes(false);
        await getPendingInvoices(setPendingCant,setPendingInvoices);
    }
    const confirmDelete = async () => {
        await confirmarBorrado(selected,setSelected,handleCloseDelete,toast,getPendingInvoices);
        await getPendingInvoices(setPendingCant,setPendingInvoices);
    }
    const salir = () => {
        sessionStorage.clear();
        navigate("/login");
    }
    const handleFindClient = (e,newValue) => {
        if(newValue){
            setSelected({
                ...selected,
                cuit: newValue.cuit
            })
        }
    }
    const handleChange = (propiedad,e) => {
        setSelected({
            ...selected,
            [propiedad]: e.target.value
        })
    }
    useEffect(()=>{
        verifyRole(setRole);
        getPendingInvoices(setPendingCant,setPendingInvoices);
        const token = sessionStorage.getItem("x-token");
        if(!token){
            navigate("/login");
        };
        getProfilePhoto(setPhoto);
        getClientCuits(setClientCuits);
    },[isLoggedIn]);
    return(
        <div className="main-app">
            <Toaster/>
            <Modal open={open} onClose={handleCloseEditar} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <React.Fragment>
                    <TabsContainer setNewPhoto={setPhoto} handleCloseEditar={handleCloseEditar}/>
                </React.Fragment>
            </Modal>
            {/* Remitos / facturas pendientes de revision */}
            <Modal open={openPendientes} onClose={handleClosePendientes}>
                <Box sx={{...stylesModal, width: "80%", height: "90%"}}>
                    <h4 className="title-helper">Facturas y remitos para revisión</h4>
                        <DataGrid
                          sx={{marginTop: "20px",height: "100%", width: "95%"}}
                          autoPageSize
                          rows={pendingInvoices}
                          columns={pendingColumns}
                          rowHeight={45}
                          localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                        />
                    <Button onClick={handleClosePendientes} sx={{marginTop: 4}} variant="outlined">Salir</Button>
                </Box>
            </Modal>
            <Modal open={openDelete} onClose={handleCloseDelete}>
                <Box sx={stylesModal}>
                    <h4 className="title-helper">¿Confirma que desea borrar la factura?</h4>
                    <Stack spacing={1} direction="row">
                        <Button onClick={confirmDelete} variant="outlined" color="success">Si</Button>
                        <Button onClick={handleCloseDelete} variant="outlined" color="error">No</Button>
                    </Stack>
                </Box>
            </Modal>
            {/* Editar remito incompleto */}
            <Modal open={openEdit} onClose={handleCloseEdit}>
                <Box sx={{...stylesModal,width: "80%", height: "70%", flexDirection: "row", alignItems: "center", justifyContent: "space-around"}}>
                    <div>
                        <h4 className="title-helper">Editar datos de factura</h4>
                        <Box sx={{marginBottom: 3}}>
                            <Autocomplete
                                disablePortal
                                id="clientcuits"
                                options={clientCuits}
                                size="small"
                                onChange={handleFindClient}
                                renderInput={(params)=> <TextField {...params} label="Buscar cliente"/>}
                            />
                        </Box>
                        <Box sx={{marginBottom: 3}}>
                            <TextField onChange={(e)=>{handleChange("cuit",e)}} InputLabelProps={{shrink: true}} value={selected?.cuit} size="small" label="CUIT" type="text"/>
                        </Box>
                        <Box sx={{marginBottom: 3}}>
                            <TextField onChange={(e)=>{handleChange("boca",e)}} value={selected?.boca} size="small" label="Boca de destino" type="text"/>
                        </Box>
                        <Box sx={{marginBottom: 3}}>
                            <TextField onChange={(e)=>{handleChange("remito",e)}} value={selected?.remito} size="small" label="Remito" type="text"/>
                        </Box>
                        <Box sx={{marginBottom: 3}}>
                            <TextField onChange={(e)=>{handleChange("factura",e)}} value={selected?.factura} size="small" label="Factura" type="text"/>
                        </Box>
                        <Box sx={{marginBottom: 5}}>
                            <TextField onChange={(e)=>{handleChange("fecha",e)}} value={selected?.fecha} size="small" label="Fecha" type="text"/>
                        </Box>
                        <Stack spacing={1} direction="row">
                            <Button onClick={()=>{confirmarRemito(selected,setSelected,setOpenEdit,getPendingInvoices,toast)}} variant="outlined" color="success">Confirmar</Button>
                            <Button onClick={handleCloseEdit} variant="outlined" color="error">Cancelar</Button>
                        </Stack>
                    </div>
                    <div style={{width: "70%", height: "100%"}}>
                        {
                            sidePdf ? 
                            <object style={{boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.08)"}} data={sidePdf} type="application/pdf" width="100%" height="100%"></object>
                            :
                            <img src={loadingSpinner} alt="loading"/>
                        }
                    </div>
                </Box>
            </Modal>
            <Modal open={openSupervisar} onClose={handleCloseSupervisar} aria-labelledby="modal-modal-title">
                <Box sx={stylesModal}>
                    <h4 className="title-helper">Seleccione una foto para comenzar:</h4>
                    <Button sx={{marginTop: "20px"}} onClick={handleClickUpload} variant="outlined" startIcon={<FileUploadIcon />}>
                        <input onChange={handleFileSelect} ref={fileInputRef} accept="image/*" style={{display: "none"}} type="file"/>
                        {
                            imagen ? "Seleccionar otra imagen" : "Subir imagen"
                        }
                    </Button>
                    {
                        imagenRecortada ? <img src={imagenRecortada}/> : <></>
                    }
                </Box>
            </Modal>
            <Modal open={openCrop} onClose={handleCloseCrop}>
                <Box sx={stylesModal}>
                    <h4 className="title-helper">Recorte el área que desea</h4>
                    <ReactCrop crop={corte} onChange={c => setCorte(c)}>
                      <img src={image}/>
                    </ReactCrop>
                    <Button sx={{marginTop: 10}} onClick={handleImagenRecortada} variant="outlined">Confirmar corte</Button>
                </Box>
            </Modal>
            <div className="header">
                <div className="company-card">
                    <img className="profile-header-img" src={logo} alt="perfil empresa"/>
                </div>
                <nav className="menu">
                    {
                        (role === "CLIENT_USER" || role === null) ? <></> : 
                        <>
                            <button type="button" onClick={managePendings}>
                                {
                                    pendingCant>0 ? 
                                        <Badge badgeContent={pendingCant} color="error">
                                            <ReceiptIcon/>
                                        </Badge> 
                                        : 
                                        <ReceiptIcon/>
                                }
                                <span>Revisión</span>
                            </button>
                            <button type="button" onClick={startEditProfile}>
                                <AccountCircleIcon/>
                                <span>Editar perfil</span>
                            </button>
                            <button type="button" onClick={startSupervisacion}>
                                <PlaylistAddCheckCircleIcon/>
                                <span>Supervisación</span>
                            </button>
                        </>
                    }
                    <button type="button" onClick={salir}>
                        <ExitToAppIcon/>
                        <span>Salir</span>
                    </button>
                </nav>
            </div>
            <Divider/>
            <div className="main-content">
                <Inventario/>
            </div>
        </div>
    )
}

export default Main;
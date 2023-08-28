import React, { useEffect, useRef, useState } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import Stack from '@mui/material/Stack';
import axios from 'axios';
import { server } from '../../helpers/constants';

const DetallesTab = ({setProfilePhoto,setNewPhoto,setClientData,clientData,getData}) => {
    const inputFile = React.useRef(null);
    const onFileClick = () => {
      inputFile.current.click();
    }
    const handlePhotoSelect = async (e) => {
        if(e.target.files[0]){
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const fotoBase64 = reader.result.split(',')[1];
                setClientData({
                    ...clientData,
                    client: {
                        ...clientData.client,
                        logo: fotoBase64
                    }
                });
                setNewPhoto(fotoBase64);
                setProfilePhoto(fotoBase64);
                try{
                    const token = sessionStorage.getItem("x-token");
                    await axios.put(`${server}/api/clients/photo`,{
                        foto: fotoBase64,
                        clientId: clientData.client._id
                      },{
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                }catch(e){
                    console.log(e.message);
                }
            }
        }else{
            return;
        }
    }
    const handleChangeNombre = (e) => {
        setClientData({
            ...clientData,
            name: e.target.value
        })
    }
    const handleChangeCuit = (e) => {
        setClientData({
            ...clientData.client,
            cuit: e.target.value
        })
    }
    const handleChangePhone = (e) => {
        setClientData({
            ...clientData,
            phone: e.target.value
        })
    }
    const handleChangeMail = (e) => {
        setClientData({
            ...clientData,
            mail: e.target.value
        })
    }
    return(
        <div className="detalle-cliente-form">
            <h4 className="title-helper">Detalles del cliente</h4>
            <Box component="form" sx={{marginTop: "30px", width: "50%"}} noValidate autoComplete="off">
                <FormControl>
                    <TextField sx={{marginRight: "30px"}} type="text" label="Nombre del cliente" value={clientData?.name} onChange={handleChangeNombre}/> 
                </FormControl>
                <FormControl>
                    <TextField type="number" sx={{marginRight: "30px"}} label="CUIT" value={clientData?.cuit} onChange={handleChangeCuit}/>
                </FormControl>
                <Button onClick={onFileClick} sx={{marginRight: "30px"}} variant="outlined" color="primary" startIcon={<PhotoCameraIcon/>}>
                    <input onChange={handlePhotoSelect} accept="image/*" type="file" ref={inputFile} style={{display: "none"}}/>
                    Cambiar logo
                </Button>
            </Box>
            <h4 className="title-helper">Detalles del usuario</h4>
            <Box component="form" sx={{marginTop: "30px", width: "50%"}} noValidate autoComplete="off">
                <FormControl>
                    <TextField sx={{marginRight: "30px"}} type="phone" label="Teléfono" value={clientData?.phone} onChange={handleChangePhone}/>
                </FormControl>
                <FormControl>
                    <TextField sx={{marginRight: "30px"}} type="email" label="Correo" value={clientData?.mail} onChange={handleChangeMail}/>
                </FormControl>
            </Box>
        </div>
    )
}

export default DetallesTab;
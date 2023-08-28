import React, {useEffect,useState} from 'react';
import axios from 'axios';
import loadingGif from "../../img/LoadingGif.gif";
import logo from "../../img/CompanyLogo.jpg";

import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import NoPhoto from "../../img/NoPhoto.png";
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Stack from '@mui/material/Stack';
import DetallesTab from './DetallesTab';
import ClientesTab from './ClientesTab';
import { server } from '../../helpers/constants';

function TabPanel(props) {
  const { data, children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}
TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};
function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function TabsContainer({setNewPhoto,handleCloseEditar,setData,data}) {
  const [value, setValue] = useState(0);
  const [newData,setNewData] = useState({});
  const [clientData,setClientData] = useState(data);
  const [profilePhoto,setProfilePhoto] = useState(null);
  const [loading,setLoading] = useState(false);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const getClientData = async () => {
    setLoading(true);
    const token = sessionStorage.getItem("x-token");
    try{
        const result = await axios.get(`${server}/api/clients/data`,{
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        setClientData(result.data);
        setProfilePhoto(result.data.logo);
    }catch(e){
        console.log(e.message);
        setProfilePhoto(null);
    }
    setLoading(false);
  }
  const confirmarCambios = async () => {
    const token = sessionStorage.getItem('x-token');
    try{
      await axios.put(`${server}/api/clients`,{
        name: clientData.name,
        cuit: clientData.cuit,
        _id: clientData._id,
        mail: clientData.mail,
        phone: clientData.phone
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      );
    }catch(e){
      console.log(e);
    }
  }
  useEffect(()=>{
    getClientData();
  },[])
  return (
    <Box sx={{ width: '90%', height: "90%", backgroundColor: "white", margin: "0 auto", marginTop: "30px", padding: "20px",borderRadius: "6px"}}>
      <div className="profile-data-header">
        {
            loading ? 
            <img className="loading" src={loadingGif} alt="Cargando.."/> :
            <img src={logo} alt="profile photo"/>
        }
      </div>
      <Box sx={{ borderBottom: 1, borderColor: 'divider'}}>
        <Tabs value={value} onChange={handleChange} aria-label="Editar">
          <Tab label="Detalles del perfil" {...a11yProps(0)} />
          <Tab label="Clientes" {...a11yProps(1)}/>
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        {
          loading ? <h4>Cargando..</h4> : <DetallesTab setProfilePhoto={setProfilePhoto} setNewPhoto={setNewPhoto} getData={getClientData} setClientData={setClientData} clientData={clientData}/>
        }
        <Stack direction="row" spacing={5} marginTop="30px" justifyContent="center">
          <Button onClick={confirmarCambios} color="success" variant="outlined">Confirmar cambios</Button>
          <Button onClick={handleCloseEditar} color="error" variant="outlined">Salir</Button>
        </Stack>
      </TabPanel>
      <TabPanel value={value} index={1}>
        {
          loading ? <h4>Cargando..</h4> : <ClientesTab clientData={clientData}/>
        }
        <Stack direction="row" spacing={5} marginTop="30px" justifyContent="center">
          <Button onClick={handleCloseEditar} color="error" variant="outlined">Salir</Button>
        </Stack>
      </TabPanel>
    </Box>
  );
}
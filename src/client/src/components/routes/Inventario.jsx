import React, { useEffect, useState } from "react";
import { DataGrid, esES, GridToolbar } from '@mui/x-data-grid';
import { ThemeProvider,createTheme } from '@mui/material/styles';
import toast, { Toaster } from 'react-hot-toast';
import Button from '@mui/material/Button';
import loadingSpinner from "../../img/LoadingGif.gif";
import { GridToolbarContainer,
  GridToolbarExportContainer,
  GridCsvExportMenuItem,
  useGridApiContext,
  gridFilteredSortedRowIdsSelector,
  gridVisibleColumnFieldsSelector, } from '@mui/x-data-grid';
import Menu from '@mui/material/Menu';
import * as XLSX from "xlsx";
import {Autocomplete, Box } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Modal from "@mui/material/Modal";
import axios from "axios";
import { server, stylesModal } from "../../helpers/constants";
import { generateCode } from "../../helpers/mainHelpers";
import { RendicionPdf } from "../RendicionPdf";

const theme = createTheme({
    typography: {
      fontFamily: [
        'Manrope','Inter'
      ].join(','),
    },
});
const csvOptions = {delimiter: ";"};


const Inventario = () => {
    const [loading,setLoading] = useState(false);
    const [role,setRole] = useState(null);
    const [facturas,setFacturas] = useState([]);    
    const [openEditar,setOpenEditar] = useState(false);
    const [selected,setSelected] = useState({});
    const [invoicesToCheck,setInvoicesToCheck] = useState([]);
    const [clientCuits,setClientCuits] = useState([]);
    const [openBorrar,setOpenBorrar] = useState(false);
    const [openCheck,setOpenCheck] = useState(false);
    const [selectedInvoices,setSelectedInvoices] = useState([]);
    const [sidePdf,setSidePdf] = useState(null);
    const [checkId,setCheckId] = useState("");
    const [pdfData,setPdfData] = useState(null);
    const handleCloseCheck = () => {
      setCheckId("");
      setSelected({});
      setOpenCheck(false);
      getFacturas();
      getClientCuits();
    }
    const startCheck = async (e) => {
      if(role !== "CLIENT_ADMIN" && role !== "SUPER_ADMIN"){
        return toast.error("No tiene acceso a esta funcionalidad");
      }
      e.stopPropagation();
      setCheckId(generateCode());
      const token = sessionStorage.getItem("x-token");
      try{
        const response = await axios.post(`${server}/api/bills/check/startcheck`,selectedInvoices,{
          headers: {Authorization: `Bearer ${token}`}
        });
        setInvoicesToCheck(response.data);
        setOpenCheck(true);
      }catch(e){
        toast.error(`Error al realizar chequeo de facturas: \n\n${e.response.data.msg}`);
      }
    }
    /* Handlers Edicion */
    const iniciarEdicion = (e,data) => {
      if(role !== "CLIENT_ADMIN" && role !== "SUPER_ADMIN"){
        return toast.error("No tiene acceso a esta funcionalidad");
      }
      e.stopPropagation();
      viewPdfOnSide(data);
      setSelected(data);
      setOpenEditar(true);
    }
    const handleCloseEditar = () => {
      setSidePdf(null);
      setSelected({});
      setOpenEditar(false);
      getClientCuits();
      getFacturas();
    }
    const confirmarEdicion = async () => {
      if(selected.remito === "" || selected.cuit === "" || selected.date === ""){
        return toast.error("Por favor, complete todos los campos");
      }
      const token = sessionStorage.getItem("x-token");
      try{
        await axios.put(`${server}/api/bills/`,selected,{
          headers: {
              Authorization: `Bearer ${token}`
          }
        });
        getClientCuits();
        getFacturas();
        setSelected({});
        setSidePdf(null);
        setOpenEditar(false);
      }catch(e){
        toast.error(`Hubo un error al editar la factura: \n${e.message}`);
        setSelected({});
        setSidePdf(null);
        setOpenEditar(false);
      }
    }
    /* Handlers borrado */
    const iniciarBorrado = (e,data) => {
      if(role !== "CLIENT_ADMIN" && role !== "SUPER_ADMIN"){
        return toast.error("No tiene acceso a esta funcionalidad");
      }
      e.stopPropagation();
      setSelected(data);
      setOpenBorrar(true);
    }
    const handleCloseBorrado = () => {
      setSelected({});
      setOpenBorrar(false);
      getClientCuits();
      getFacturas();
    }
    const confirmarBorrado = async () => {
      const token = sessionStorage.getItem("x-token");
      try{
        await axios.delete(`${server}/api/bills/${selected.id}`,{
          headers: {
              Authorization: `Bearer ${token}`
          }
        });
        setSelected({});
        setOpenBorrar(false);
        await getFacturas();
      }catch(e){
        setSelected({});
        setOpenBorrar(false);
        await getFacturas();
      }
    }
    const handleChange = (propiedad,e) => {
      setSelected({
        ...selected,
        [propiedad]: e.target.value
      })
    }
    const columns = [
        {field: "date", headerName: "Fecha",width: 150},
        {field: "cuit",headerName: "CUIT",width: 180},
        {field: "cliente",headerName: "Cliente", width: 200},
        {field: 'remito', headerName: 'Remito', width: 200 },
        {field: 'numeroBoca', headerName: 'Boca de destino', width: 350 },
        {field: "rendido",headerName: "Rendido", width: 150,renderCell: (params)=>{
          return params.row.rendido ? <Chip label="Rendida" color="success"/> : <Chip label="Pendiente" color="warning"/>
        }},
        {field: "checkId", headerName: "N° Rendición", width: 150},
        {field: "actions", headerName: "Acciones", width: 250, renderCell: (params)=>{
          return(
            <Stack spacing={2} direction="row">
              <Tooltip title="Editar">
                  <IconButton disabled={params.row.rendido} onClick={(e)=>{iniciarEdicion(e,params.row)}} color="primary">
                      <EditIcon/>
                  </IconButton>
              </Tooltip>
              <Tooltip title="Borrar remito">
                  <IconButton disabled={params.row.rendido} onClick={(e)=>{iniciarBorrado(e,params.row)}} color="error">
                      <DeleteIcon/>
                  </IconButton>
              </Tooltip>
              <Tooltip title="Vista previa">
                  <IconButton onClick={(e)=>{vistaPrevia(e,params.row)}}>
                      <VisibilityIcon color="info"/>
                  </IconButton>
              </Tooltip>
              <Tooltip title="Descargar remito">
                  <IconButton onClick={(e)=>{descargarFactura(e,params.row)}}>
                      <DownloadIcon color="secondary"/>
                  </IconButton>
              </Tooltip>
            </Stack>
          )
        }}
    ];
    const getFacturas = async () => {
      setLoading(true)
      try{
        const token = sessionStorage.getItem("x-token");
        const result = await axios.get(`${server}/api/bills`,{
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setFacturas(result.data);
      }catch(e){
        console.log(e);
      }
      setLoading(false);
    }
    const descargarFactura = async (e,data) => {
      e.stopPropagation();
      const invoice = data;
      const token = sessionStorage.getItem("x-token");
      try{
        const response = await axios.get(`${server}/api/bills/download/${invoice.id}`,{
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const url = URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = url;
        link.download = `factura_${invoice.id}.pdf`;
        link.click();
      }catch(e){
        console.log(e);
      }
    }
    const vistaPrevia = async (e,data) => {
      e.stopPropagation();
      const invoice = data;
      const token = sessionStorage.getItem("x-token");
      try{
        const response = await axios.get(`${server}/api/bills/download/${invoice.id}`,{
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
    const confirmarChequeo = async () => {
      setLoading(true);
      const token = sessionStorage.getItem('x-token');
      try{
        await axios.post(`${server}/api/bills/check`,invoicesToCheck,{headers: {Authorization: `Bearer ${token}`}});
        toast.success(`Se han chequeado con éxito las facturas`);
        handleCloseCheck();
        await getFacturas();
        setLoading(false);
      }catch(e){
        toast.error(`Hubo un error al chequear las facturas: \n\n${e}`);
        handleCloseCheck();
        setLoading(false);
      }
      setLoading(false);
    }
    const handleChangeSelectedInvoices = (newSelection) => {
      setSelectedInvoices(newSelection);
    }
    /* DESCARGAR EXCEL */
    const downloadExcel = (facturas) => {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(facturas);
      XLSX.utils.book_append_sheet(workbook, worksheet, `Facturas`);
      const nombreArchivo = `Facturas.xlsx`;
      XLSX.writeFile(workbook, nombreArchivo);
    }
    const getExcel = (apiRef) => {
        const filteredSortedRowIds = gridFilteredSortedRowIdsSelector(apiRef);
        const visibleColumnsField = gridVisibleColumnFieldsSelector(apiRef);
        const data = filteredSortedRowIds.map((id) => {
          const row = {};
          visibleColumnsField.forEach((field) => {
            row[field] = apiRef.current.getCellParams(id, field).value;
          });
          return row;
        });
        const parsedToDownload = data.map((emp)=>{
            return {
                CLIENTE: emp.cliente,
                CUIT: emp.cuit,
                FECHA: emp.date,
                BOCA_DE_DESTINO: emp.numeroBoca,
                REMITO: emp.remito,
                RENDIDO: emp.rendido ? "SI" : "NO",
                CHEQUEADO: emp.__check__ ? "SI" : "NO",
                NUMERO_RENDICION: emp.checkId
            }
        });
        downloadExcel(parsedToDownload);
    };
    const ExcelExportMenuItem = (props) => {
      const apiRef = useGridApiContext();
      const {hideMenu} = props;
      return (
        <MenuItem
          onClick={()=>{
            getExcel(apiRef);
            hideMenu?.();
          }}
        >
          Exportar EXCEL
        </MenuItem>
      )
    }
    const CustomExportButton = (props) => {
      return (
        <GridToolbarExportContainer {...props}>
          <GridCsvExportMenuItem options={csvOptions}/>
          <ExcelExportMenuItem/>
        </GridToolbarExportContainer>
      )
    }
    const CustomToolbar = (props) => {
      return (
        <GridToolbarContainer {...props}>
          <CustomExportButton/>
        </GridToolbarContainer>
      )
    }
    const verifyRole = async () => {
      try{
          const token = sessionStorage.getItem("x-token");
          const response = await axios.get(`${server}/api/clients/rolecheck/check`,{
              headers: {
                  Authorization: `Bearer ${token}`
              }
          });
          setRole(response.data);
      }catch(e){
          console.log(e.message);
      }
    }
    const viewPdfOnSide = async (invoice) => {
      const token = sessionStorage.getItem("x-token");
      try{
        const response = await axios.get(`${server}/api/bills/download/${invoice.id}`,{
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
    const handleFindClient = (e,newValue) => {
      if(newValue){
          setSelected({
              ...selected,
              cuit: newValue.cuit
          })
      }
    }
    const getClientCuits = async () => {
      try{
          const token = sessionStorage.getItem("x-token");
          const response = await axios.get(`${server}/api/clients/cuits/all`,{
              headers: {
                  Authorization: `Bearer ${token}`
              }
          });
          setClientCuits(response.data);
      }catch(e){
          console.log(e);
      }
    }
    useEffect(()=>{
      getClientCuits();
      getFacturas();
      verifyRole();
    },[])
    return(
        <div className="content">
            <Toaster/>
            {/* Modal Editar */}
            <Modal open={openEditar} onClose={handleCloseEditar}>
              <Box sx={{...stylesModal,width: "80%", height: "70%", flexDirection: "row", alignItems: "center", justifyContent: "space-around"}}>
                <div>
                  <h4 className="title-helper">Editar remito</h4>
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
                  <Box sx={{marginBottom: 4}}>
                    <TextField value={selected?.cuit} onChange={(e)=>{handleChange("cuit",e)}} type="text" label="CUIT" size="small"/>
                  </Box>
                  <Box sx={{marginBottom: 4}}>
                    <TextField value={selected?.date} onChange={(e)=>{handleChange("date",e)}} type="text" label="Fecha" size="small"/>
                  </Box>
                  <Box sx={{marginBottom: 4}}>
                    <TextField value={selected?.remito} onChange={(e)=>{handleChange("remito",e)}} type="text" label="Remito" size="small"/>
                  </Box>
                  <Box sx={{marginBottom: 1}}>
                    <TextField value={selected?.numeroBoca} onChange={(e)=>{handleChange("numeroBoca",e)}} type="text" label="Boca de destino" size="small"/>
                  </Box>
                  <Stack sx={{marginTop: 4}} direction="row" spacing={1}>
                    <Button onClick={confirmarEdicion} color="primary" variant="contained">Confirmar</Button>
                    <Button onClick={handleCloseEditar} color="error" variant="outlined">Cancelar</Button>
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
            {/* Modal Borrar */}
            <Modal open={openBorrar} onClose={handleCloseBorrado}>
              <Box sx={stylesModal}>
                <h4 className="title-helper">¿Está seguro que desea eliminar el remito?</h4>
                <Stack sx={{marginTop: 4}} direction="row" spacing={1}>
                  <Button onClick={confirmarBorrado} color="primary" variant="contained">Confirmar</Button>
                  <Button onClick={handleCloseBorrado} color="error" variant="outlined">Cancelar</Button>
                </Stack>
              </Box>
            </Modal>
            {/* Modal Check */}
            <Modal open={openCheck} onClose={handleCloseCheck}>
              <Box sx={{...stylesModal, height: "660px", width: "600px"}}>
                <h4 className="title-helper">Confirmar chequeo</h4>
                <Box sx={{height: "600px", display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <RendicionPdf cancel={handleCloseCheck} confirmarChequeo={confirmarChequeo} data={invoicesToCheck}/>
                </Box>
              </Box>
            </Modal>
            <div className="facturas-tabla">
                <ThemeProvider theme={theme}>
                    <DataGrid
                      isRowSelectable={(params) => params.row.rendido === false}
                      slots={{ toolbar: CustomToolbar }}
                      loading={loading}
                      checkboxSelection
                      onRowSelectionModelChange={handleChangeSelectedInvoices}
                      sx={{marginTop: "20px",marginBottom: "10px", height: "98%"}}
                      autoPageSize
                      rows={facturas}
                      columns={columns}
                      rowHeight={45}
                      localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                    />
                </ThemeProvider>
            </div>
            <Button disabled={selectedInvoices.length===0} variant="outlined" onClick={startCheck}>Chequear facturas</Button>
        </div>
    )
}

export default Inventario;
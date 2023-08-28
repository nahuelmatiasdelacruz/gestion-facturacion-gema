import axios from "axios";
import { server } from "./constants";

export const confirmarRemito = async (selected,setSelected,setOpenEdit,getPendingInvoices,toast) => {
    if(selected.remito === "" || selected.fecha === "" || selected.cuit === ""){
        return toast.error(`Por favor, complete los siguientes campos:\n \nRemito\nFecha\nCuit`);
    }
    try{
        const token = sessionStorage.getItem("x-token");
        await axios.post(`${server}/api/bills/pending`,selected,{
            headers:{
                Authorization: `Bearer ${token}`
            }
        });
        setSelected({});
        setOpenEdit(false);
        await getPendingInvoices();
    }catch(e){
        toast.error("Hubo un error al editar la factura seleccionada");
        setSelected({});
        setOpenEdit(false);
    }
}
export const confirmarBorrado = async (selected,setSelected,handleCloseDelete,toast) => {
    const token = sessionStorage.getItem("x-token");
    try{
        await axios.delete(`${server}/api/bills/pending/${selected.id}`,{
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        setSelected({});
        handleCloseDelete();
    }catch(e){
        console.log(e);
        toast.error("Hubo un error al borrar el remito");
        setSelected({});
        handleCloseDelete();
    }
}
export const vistaPrevia = async (e,invoice,toast) => {
    e.stopPropagation();
    const token = sessionStorage.getItem("x-token");
    try{
      const response = await axios.get(`${server}/api/bills/download/failed/${invoice.id}`,{
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
export const generateCode = () => {
    return Date.now();
}
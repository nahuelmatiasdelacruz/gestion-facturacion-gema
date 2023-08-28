import axios from "axios";
import { server } from "./constants";

export const getProfilePhoto = async (setPhoto) => {
    const token = sessionStorage.getItem("x-token");
    try{
        const photo = await axios.get(`${server}/api/clients/photo/getPhoto`,{
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        setPhoto(photo.data);
    }catch(e){
        console.log(e.message);
        setPhoto(null);
    }
}
export const verifyRole = async (setRole) => {
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
export const getPendingInvoices = async (setPendingCant,setPendingInvoices) => {
    try{
        const token = sessionStorage.getItem("x-token");
        const response = await axios.get(`${server}/api/bills/pending/cant`,{
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        setPendingCant(response.data.length);
        setPendingInvoices(response.data);
    }catch(e){
        console.log(e.message);
    }
}
export const getClientCuits = async (setClientCuits) => {
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
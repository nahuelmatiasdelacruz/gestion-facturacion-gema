import React, { useState } from "react";
import CompanyLogo from "../img/CompanyLogo.jpg";
import LoadingGif from "../img/LoadingGif.gif";
import axios from "axios";
import { server } from "../helpers/constants";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

const Login = ({setLoggedIn,setRole}) => {
    const navigate = useNavigate();
    const [loading,setLoading] = useState(false);
    const [user,setUser] = useState("");
    const [password,setPassword] = useState("");

    const changeUser = (e) => {
        setUser(e.target.value);
    }
    const changePassword = (e) => {
        setPassword(e.target.value);
    }
    const handleLogin = async () => {
        setLoading(true);
        if(user === "" || password === ""){
            setLoading(false);
            return toast.error("Por favor, complete los campos de usuario y contraseña");
        }
        try{
            const result = await axios.post(`${server}/api/auth`,{user,password});
            const {foundUser,token} = result.data;
            setRole(foundUser.role);
            sessionStorage.setItem("userName",foundUser.userName);
            sessionStorage.setItem("userId",foundUser.uid);
            sessionStorage.setItem("x-token",token);
            setLoggedIn(true);
            setLoading(false);
            navigate("/");
        }catch(e){
            console.log(e.message);
            toast.error(`Error al iniciar sesión:`);
            setLoading(false);
        }
    }

    return(
        <React.Fragment>
            <Toaster/>
            <div className="login-component">
                <div className="login-form">
                    <img src={CompanyLogo} alt="Logo Imagen"/>
                    <div className="inputs-container">
                        <input onChange={changeUser} type="text" className="" placeholder="Usuario"/>
                        <input onChange={changePassword} type="password" placeholder="Password"/>
                    </div>
                    <button type="submit" className={loading ? "loading-button-l" : "loading-button"} onClick={handleLogin}>
                        {
                            loading ? 
                            <img src={LoadingGif} alt="Loading"/> : "Iniciar sesión"
                        }
                    </button>
                </div>
            </div>
        </React.Fragment>
    )
}

export default Login;
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from "./components/Main";
import Login from "./components/Login";
import Inventario from "./components/routes/Inventario";

function App() {
  const [loggedIn,setLoggedIn] = useState(false);
  const [role,setRole] = useState(null);
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/login" element={<Login setRole={setRole} setLoggedIn={setLoggedIn}/>}/>
        <Route exact path="/" element={<Main userRole={role} isLoggedIn={loggedIn}/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

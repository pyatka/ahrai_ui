import React from 'react';
import { useParams, Redirect } from "react-router-dom";

function Settoken() {
    let { token } = useParams();
    localStorage.setItem("token", token);
    return <Redirect to='/' />
}

export default Settoken;
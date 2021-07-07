import React, { useState, useEffect } from 'react';
import { Link, Redirect } from 'react-router-dom';
import Layout from '../core/Layout';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

const Activate = ({ match, history }) => {

    const [values, setValues] = useState({
        name: "",
        token: "",
        show: true

    })
    useEffect(() => {
        let token = match.params.token;
        let { name } = jwt.decode(token);
        // console.log('token')
        if (token) {
            setValues({ ...values, name, token });
        }
    }, [])

    const { name, token, show } = values;


    const clickSubmit = event => {
        event.preventDefault()

        axios({
            method: 'POST',
            url: `${process.env.REACT_APP_API}/account-activation`,
            data: { token }
        })
            .then(response => {
                console.log('Activation success', response);
                setValues({ ...values, show: false })
                toast.success(response.data.message);
                history.push('/signin')
            })
            .catch(error => {
                console.log('Activation Failed', error.response.data.error)
                toast.error(error.response.data.error);
            })
    }

    const activationLink = () => (
        <div className="text-center">
            <h1 className="p-5">Hey {name}, Ready to Activate your Account?</h1>
            <button className="btn btn-success" onClick={clickSubmit}>
                Activate Account
            </button>
        </div>
    );

    return (
        <div className="activate">
            <div className="op5">
                <div className="col-md-8 offset-md-3">
                    <ToastContainer />
                    {activationLink()}
                </div>
            </div>
            <div className="nav_format">
                <Layout>
                </Layout>
            </div>
        </div>
    );
};

export default Activate;
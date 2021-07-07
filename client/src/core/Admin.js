import React, { useState, useEffect } from 'react';
import { Link, Redirect } from 'react-router-dom';
import Layout from '../core/Layout';
import axios from 'axios';
import { isAuth, getCookie, signout, updateUser } from '../auth/Helpers';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

const Admin = ({ history }) => {
    const [values, setValues] = useState({
        role: '',
        name: '',
        email: '',
        password: '',
        buttonText: 'Submit'
    });

    const token = getCookie('token');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = () => {
        axios({
            method: 'GET',
            url: `${process.env.REACT_APP_API}/user/${isAuth()._id}`,
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                console.log('ADMIN PROFILE UPDATE', response);
                const { role, name, email } = response.data;
                setValues({ ...values, role, name, email });
            })
            .catch(error => {
                console.log('ADMIN PROFILE UPDATE ERROR', error.response.data.error);
                if (error.response.status === 401) {
                    signout(() => {
                        history.push('/');
                    });
                }
            });
    };

    const { role, name, email, password, buttonText } = values;

    const handleChange = name => event => {
        // console.log(event.target.value);
        setValues({ ...values, [name]: event.target.value });
    };

    const clickSubmit = event => {
        event.preventDefault();
        setValues({ ...values, buttonText: 'Submitting' });
        axios({
            method: 'PUT',
            url: `${process.env.REACT_APP_API}/admin/update`,
            headers: {
                Authorization: `Bearer ${token}`
            },

            data: { name, password }
        })
            .then(response => {
                console.log('UPDATION SUCCESS', response);
                updateUser(response, () => {

                    setValues({ ...values, buttonText: 'Submitted' });
                    toast.success('Profile Updated Successfully ');
                })

            })
            .catch(error => {
                console.log('UPDATION ERROR', error.response.data.error);
                setValues({ ...values, buttonText: 'Submit' });
                toast.error(error.response.data.error);
            });
    };

    const updateForm = () => (
        <form>
            <div className="form-group">
                <label className="text-muted"></label>
                <input defaultValue={role} type="text" className="form-control" disabled />
            </div>
            <div className="form-group">
                <label className="text-muted"></label>
                <input onChange={handleChange('name')} value={name} type="text" placeholder="Name" className="form-control" />
            </div>

            <div className="form-group">
                <label className="text-muted"></label>
                <input defaultValue={email} type="email" className="form-control" disabled />
            </div>

            <div className="form-group">
                <label className="text-muted"></label>
                <input onChange={handleChange('password')} value={password} type="password" placeholder="Password" className="form-control" />
            </div>

            <div>
                <button className="btn btn-primary" onClick={clickSubmit}>
                    {buttonText}
                </button>
            </div>
        </form>
    );

    return (
        <div className="admin">
            <div className="op2">
                <ToastContainer />
                <h2 className="pt-5 text-center">Admin</h2>
                <p className="lead text-center">Profile update</p>
                {updateForm()}
            </div>
            <div className="nav_format">
                <Layout>
                </Layout>
            </div>
        </div>
    );
};

export default Admin;
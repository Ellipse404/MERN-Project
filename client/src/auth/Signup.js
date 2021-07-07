import React, { useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import Layout from '../core/Layout';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { isAuth } from './Helpers'

const Signup = () => {

    const [values, setValues] = useState({
        name: "",
        email: "",
        password: "",
        confirmpassword: "",
        buttonText: "SUBMIT"
    })
    const { name, email, password, confirmpassword, buttonText } = values;

    const handleChange = name => event => {
        setValues({ ...values, [name]: event.target.value });
    }

    const clickSubmit = event => {
        event.preventDefault()
        setValues({ ...values, buttonText: 'Submitting' })

        axios({
            method: 'POST',
            url: `${process.env.REACT_APP_API}/signup`,
            data: { name, email, password, confirmpassword }
        })
            .then(response => {
                console.log('signup success', response);
                setValues({ ...values, name: '', email: '', password: '', confirmpassword: '', buttonText: 'Submitted' })
                toast.success(response.data.message);
            })
            .catch(error => {
                // console.log('signup failed', error.response.data)
                setValues({ ...values, buttonText: 'SUBMIT' })
                toast.error(error.response.data.error);
            })

    }

    const signupForm = () => (
        <form>
            <div className="form-group">
                <label className='text-muted'></label>
                <input onChange={handleChange('name')} value={name} type="text" placeholder="Full Name" className="form-control" />
            </div>

            <div className="form-group">
                <label className='text-muted'></label>
                <input onChange={handleChange('email')} value={email} type="email" placeholder="Email" className="form-control" />
            </div>

            <div className="form-group">
                <label className='text-muted'></label>
                <input onChange={handleChange('password')} value={password} type="password" placeholder="Password" className="form-control" />
            </div>

            <div className="form-group">
                <label className='text-muted'></label>
                <input onChange={handleChange('confirmpassword')} value={confirmpassword} type="password" placeholder="Confirm Password" className="form-control" />
            </div>

            <div className="wrap">
                <button className="buttons" onClick={clickSubmit}>{buttonText}</button>
            </div>

            <div className="container_signup">
                <p>Already have an account? <Link to="/Signin">Signin Here</Link>.</p>
            </div>

        </form>
    )

    return (
        <>
            <div className="signup">
                <div className="op">
                    <ToastContainer />
                    {isAuth() ? <Redirect to="/" /> : null}
                    <h1 className="p-5 text-center">Signup</h1>
                    {signupForm()}
                    <br />
                </div>

            </div>
            <Layout>
            </Layout>
        </>
    )
}

export default Signup
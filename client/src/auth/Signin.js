import React, { useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import Layout from '../core/Layout';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import Google from './Google'
import Facebook from './Facebook';
import 'react-toastify/dist/ReactToastify.min.css';
import { authenticate, isAuth } from './Helpers'


const Signin = ({ history }) => {

    const [values, setValues] = useState({

        email: "",
        password: "",
        buttonText: "SUBMIT"
    })
    const { email, password, buttonText } = values;

    const handleChange = name => event => {
        setValues({ ...values, [name]: event.target.value });
    }

    const informParent = response => {
        authenticate(response, () => {
            isAuth() && isAuth().role === 'admin' ? history.push('/admin') : history.push('/private');
        });
    };


    const clickSubmit = event => {
        event.preventDefault()
        setValues({ ...values, buttonText: 'Submitting' })

        axios({
            method: 'POST',
            url: `${process.env.REACT_APP_API}/signin`,
            data: { email, password }
        })
            .then(response => {
                console.log('Signin success', response);
                // save the response localstorage/cookie
                authenticate(response, () => {
                    setValues({ ...values, name: '', email: '', password: '', buttonText: 'Submitted' })
                    // toast.success(`Hey ${response.data.user.name}, Welcome Back !`);
                    isAuth() && isAuth().role === 'admin' ? history.push('/admin') : history.push('/private')
                })
            })
            .catch(error => {
                console.log('Signin failed', error.response.data)
                setValues({ ...values, buttonText: 'SUBMIT' })
                toast.error(error.response.data.error);
            })

    }

    // const signinForm = () => (

    // )

    return (
        // <Layout>
        <>

            {/* {JSON.stringify(isAuth())} */}
            <div className="signin">
                <div className="op1">
                    <ToastContainer />
                    {isAuth() ? <Redirect to="/" /> : null}     {/* authenticated user will redirect to Home page */}
                    <h1 className="p-5 text-center">Signin</h1>
                    <div className="glogin">
                        <Google informParent={informParent} />
                    </div>

                    <div className="flogin">
                        <Facebook informParent={informParent} />
                    </div>

                    <div class="vl"></div>

                    {/* {signinForm()} */}
                   
                    <form>


                        <div className="form-group">
                            <label className='text-muted'></label>
                            <input onChange={handleChange('email')} value={email} type="email" placeholder='Email' className="form-control" />
                        </div>

                        <div className="form-group">
                            <label className='text-muted'></label>
                            <input onChange={handleChange('password')} value={password} type="password" placeholder='Password' className="form-control" />
                        </div>

                        <div className="container_signin">
                            <p>Don't have an account? <Link to="/Signup">Register Here</Link>.</p>
                        </div>

                        <div className="wrapper">
                            <button className="button" onClick={clickSubmit}>{buttonText}</button>
                        </div>

                    </form>

                    <br />
                    <div className="forgetbtn">
                        <Link to="/auth/password/forgot" className="btn btn-danger btn-sm">
                            Forgot Password
                        </Link>
                    </div>

                </div>
            </div>

            <Layout>
            </Layout>
        </>
    )
}

export default Signin
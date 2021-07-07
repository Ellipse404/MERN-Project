import React, { Fragment } from 'react';
// import 'bootstrap/dist/css/bootstrap.css';
import { Link, withRouter } from 'react-router-dom';
import { isAuth, signout } from '../auth/Helpers'


const Layout = ({ children, match, history }) => {
    const isActive = path => {
        if (match.path === path) {
            return { color: '#bcfa13', background: 'rgb(0,0, 8)', fontStyle: 'italic', fontWeight: 'bold', border:"1px solid #bcfa13" };
        } else {
            return { color: 'rgb(0,0, 8)', background: '#bcfa13' }
        }
    }
    const nav = () => (
        <ul className="nav nav-tabs bg-primar ">

            <li className="nav-item ms-auto">
                <Link to="/" className="nav-link" style={isActive('/')}>
                    Home
                </Link>
            </li>


            {!isAuth() && (
                <Fragment>
                    <li className="nav-item">
                        
                        <Link to="/signup" className="nav-link" style={isActive('/signup')}>
                            Signup
                </Link>
                
                    </li>

                    <li className="nav-item">
                        <Link to="/signin" className="nav-link" style={isActive('/signin')}>
                            Signin
                </Link>
                    </li>
                </Fragment>
            )}

            {/* logout */}
            {isAuth() && isAuth().role === 'admin' && (
                <li className="nav-item">

                    <Link className="nav-link" style={isActive('/admin')} to="/admin">{isAuth().name}</Link>
                </li>
            )}

            {isAuth() && isAuth().role === 'subscriber' && (
                <li className="nav-item">

                    <Link className="nav-link" style={isActive('/private')} to="/private">{isAuth().name}</Link>
                </li>
            )}

            {isAuth() && (
                <li className="nav-item">
                    <span
                        className="nav-link"
                        style={{ cursor: 'pointer', color: 'rgb(0,0, 8)', background: '#bcfa13', height:'1cm', paddingTop:'1%', borderRadius:'6px' }}
                        onClick={() => {
                            signout(() => {
                                history.push('/');
                            });
                        }}
                    > 
                        Signout 
                    </span>
                </li>
            )}
           
        </ul>
    );

    return (
        <>
            <Fragment>
                <div>
                    {nav()}
                    <div className='container'>{children}</div>
                </div>

            </Fragment>
        </>
    )
}

export default withRouter(Layout)

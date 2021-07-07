import React from 'react';
import Layout from './core/Layout'
import './App.css'

const App = () => {
    return (
        <>
            <div className="app_body">
                <div className="col-md-6 offset-md-3 text-center">

                    <h1 className="p-5"></h1>
                    <h2>MERN STACK</h2>
                    <hr />
                    <p className="lead">
                        whatever
              </p>
                </div>
            </div>
            <div className="nav_format">
                <Layout>
                </Layout>
            </div>
        </>
    );
};

export default App;




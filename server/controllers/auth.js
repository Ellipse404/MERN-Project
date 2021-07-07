const User = require('../models/user');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt')
const _ = require('lodash')
const { OAuth2Client } = require('google-auth-library')
const fetch = require('node-fetch')
// const sgMail = require('@sendgrid/mail')
// sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const nodemailer = require('nodemailer');
const { resetPasswordValidator } = require('../validators/auth');
const { response } = require('express');


exports.signup = (req, res) => {

    const { name, email, password, confirmpassword } = req.body

    if (password !== confirmpassword) {
        return res.status(401).json({
            error: 'Password Mismatch'
        })
    }
    User.findOne({ email }).exec((err, user) => {
        if (user) {


            return res.status(400).json({
                error: 'Email is Taken'
            })
        }

        // create token
        const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '30m' })

        // send email

        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Account Activation Link`,
            html: `<h2>Click on the link to activate your account</h2>
                        <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
                        <hr />
                        <p>This Email Contains Sensitive Information. So, Don't dare to share</p>
                        <p>${process.env.CLIENT_URL}</p>`
        }
        // USING NODEMAILER
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_FROM,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        transporter.sendMail(emailData)
            .then(sent => {
                console.log("Email Sent !");
                return res.json({
                    message: `Email has been sent to ${email}. Follow the Instruction`
                })

            })
            .catch(err => {
                console.log("Something went wrong !!", error);
                return res.json({
                    message: err.message
                })
            });

        // USING SENDGRID API
        // sgMail.send(emailData).then(sent => {
        //     console.log('Email Sent')
        //     return res.json({
        //         message: `Email has been sent to ${email}.`
        //     })
        // }).catch(error => {
        //     console.log("Error", error)
        // }) 

    })

};

exports.accountActivation = (req, res) => {
    const { token } = req.body
    
    let logintype = 'Email Login'

    if (token) {
        jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function (err, decoded) {
            if (err) {
                console.log('JWT ACTIVATION ERROR', err)
                return res.status(401).json({
                    error: 'Expired Link.! Please SignUp Again'
                })
            }

            const { name, email, password } = jwt.decode(token)
            const user = new User({ name, email, password, logintype })
            user.save((err, user) => {
                if (err) {
                    console.log("Data Saving Error", err)
                    return res.status(401).json({
                        error: 'Error saving user in DB, Try Again !'
                    });
                }
                return res.json({
                    message: 'SignUp Success. Please SignIn'
                });
            })
        })
    } else {
        return res.json({
            message: 'JWT Error !. SignUp Again'
        })

    }
}

exports.signin = (req, res) => {
    const { email, password } = req.body

    // check if user exist
    User.findOne({ email }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'Email does not exist'
            })
        }

        // authenticate
        if (!user.authenticate(password)) {
            return res.status(400).json({
                error: 'Email and Password Mismatch'
            })
        }

        //generate a token & send to client
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '30m' });
        const { _id, name, email, role } = user

        return res.json({
            token,
            user: { _id, name, email, role }
        })
    })

}

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,      // req.user

})

exports.adminMiddleware = (req, res, next) => {
    User.findById({ _id: req.user._id }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }

        if (user.role !== 'admin') {
            return res.status(400).json({
                error: 'Admin resource. Access denied.'
            });
        }

        req.profile = user;
        next();
    });
};

// forgot passsword

exports.forgotPassword = (req, res) => {
    const { email } = req.body;

    User.findOne({ email }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User with that email does not exist'
            });
        }

        const token = jwt.sign({ _id: user._id, name: user.name }, process.env.JWT_RESET_PASSWORD, { expiresIn: '10m' });

        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Password Reset link`,
            html: `
                <h1>Please use the following link to reset your password</h1>
                <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
                <hr />
                <p>This email may contain sensetive information</p>
                <p>${process.env.CLIENT_URL}</p>
            `
        };

        return user.updateOne({ resetPasswordLink: token }, (err, success) => {
            if (err) {
                return res.status(400).json({
                    errror: 'Reset Password Link Error !'
                })
            } else {

                let transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_FROM,
                        pass: process.env.EMAIL_PASSWORD
                    }
                });

                transporter.sendMail(emailData)
                    .then(sent => {
                        console.log("Email Sent !");
                        return res.json({
                            message: `Email has been sent to ${email}. Follow the Instruction`
                        })

                    })
                    .catch(err => {
                        console.log("Something went wrong !!", error);
                        return res.json({
                            message: err.message
                        })
                    });

            }
        })


    });
};

// resetpassword


exports.resetPassword = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body;

    if (resetPasswordLink) {
        jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function (err, decoded) {
            if (err) {
                return res.status(400).json({
                    error: 'Expired link. Try again'
                });
            }

            User.findOne({ resetPasswordLink }, (err, user) => {
                if (err || !user) {
                    return res.status(400).json({
                        error: 'Something went wrong. Try later'
                    });
                }

                const updatedFields = {
                    password: newPassword,
                    resetPasswordLink: ''
                };

                user = _.extend(user, updatedFields);

                user.save((err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: 'Error Resetting user password'
                        });
                    }
                    res.json({
                        message: `Great! login with your new password`
                    });
                });
            });
        });
    }
};

// google login

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.googleLogin = (req, res) => {
    const { idToken } = req.body;

    let logintype = 'Google Login'

    client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })
        .then(response => {
            // console.log('GOOGLE LOGIN RESPONSE',response)
            const { email_verified, name, email } = response.payload;
            if (email_verified) {
                User.findOne({ email }).exec((err, user) => {
                    if (user) {
                        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
                        const { _id, email, name, role, logintype } = user;
                        return res.json({
                            token,
                            user: { _id, email, name, role, logintype }
                        });
                    } else {
                        let password = email + process.env.JWT_SECRET;
                        
                        user = new User({ name, email, password, logintype });
                        user.save((err, data) => {
                            if (err) {
                                console.log('ERROR GOOGLE LOGIN ON USER SAVE', err);
                                return res.status(400).json({
                                    error: 'User signup failed with google'
                                });
                            }
                            const token = jwt.sign({ _id: data._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
                            const { _id, email, name, role, logintype } = data;
                            return res.json({
                                token,
                                user: { _id, email, name, role, logintype }
                            });
                        });
                    }
                });
            } else {
                return res.status(400).json({
                    error: 'Google login failed. Try again'
                });
            }
        });
};


//facebook login

exports.facebookLogin = (req, res) => {
    let logintype = 'Facebook Login'
    // console.log('FB logged request:', req.body)
    const {userID, accessToken} = req.body

    const url  = `https://graph.facebook.com/v2.11/${userID}/?fields=id, name, email &access_token=${accessToken}`;

    return (
        fetch(url, {
            method: 'GET'
        })
        .then(response => response.json())
          .then(response => {
              const {email, name} = response
              User.findOne({ email }).exec((err, user) => {
                  if(user) {
                      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d'});
                      const { _id, email, name, role, logintype } = user;
                      return res.json({
                          token,
                          user: { _id, email, name, role, logintype }
                      });
                  } else {
                      let password = email + process.env.JWT_SECRET;
                      user = new User({ name, email, password, logintype });
                      user.save((err, data) => {
                          if(err) {
                              return res.status(400).json({
                                  error: 'User Signin Failed !'
                              });
                          }
                          const token = jwt.sign({ _id: data._id }, process.env.JWT_SECRET, { expiresIn: '7d'});
                          const { _id, email, name, role, logintype } = data;
                          return res.json({
                            token,
                            user: { _id, email, name, role, logintype }
                      });
                      })
                  }
              })
          }) .catch(error => {
              res.json({
                  error: 'Facebook Login Failed ! Try Later '
              })
          })
    )
}
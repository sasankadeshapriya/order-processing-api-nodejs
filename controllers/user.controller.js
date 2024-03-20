const models = require('../models');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('fastest-validator');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');

function signUp(req, res){
    
    models.User.findOne({where:{email:req.body.email}}).then(result => {
        if(result){
            res.status(409).json({
                message: "Email already exists!",
            });
        }else{
            const user = {
                name: req.body.name,
                email:req.body.email,
                password: req.body.password 
            }
            
            const schema = {
                name: { type: "string", optional: false, max: 50, pattern: /^[a-zA-Z\s]+$/ },
                email: { type: "email", optional: false, max: 35 },
                password: { type: "string", optional: false, min: 8 }
            };
            
            const vldator = new validator();
            const validationResponse = vldator.validate(user,schema);
            
            if(validationResponse !== true){
                return res.status(400).json({
                    message:"Validation failed",
                    error:validationResponse
                });
            }
            
            bcryptjs.genSalt(10, function(err, salt){
                bcryptjs.hash(user.password, salt, function(err, hash){
                    user.password = hash; 

                    models.User.create(user).then(result => {
                        res.status(201).json({
                            message: "User created successfully",
                        });
                    }).catch(error => {
                        console.log(error);
                        res.status(500).json({
                            message: "Something went wrong!",
                        });
                    });
                });
            });
        }
    }).catch(error => {
        console.log(error);
        res.status(500).json({
            message: "Something went wrong!",
        });
    });
}

function login(req, res) {
    models.User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user === null) {
            res.status(401).json({
                message: "Invalid credentials!",
            });
        } else {
            bcryptjs.compare(req.body.password, user.password, function (err, result) {
                if (result) {
                    const otp = Math.floor(1000 + Math.random() * 9000);

                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.GMAIL_USER,
                            pass: process.env.GMAIL_PASS
                        }
                    });

                    const mailOptions = {
                        from: process.env.GMAIL_USER,
                        to: user.email,
                        subject: 'OTP for login verification',
                        text: `Your OTP for login is: ${otp}`
                    };

                    console.log(user.email);

                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                            res.status(500).json({
                                message: "Error sending OTP!",
                            });
                        } else {
                            console.log('Email sent: ' + info.response);

                            
                            user.update({ otp: otp }).then(updatedUser => {
                                res.status(200).json({
                                    message: "OTP sent successfully!",
                                    email: user.email
                                });
                            }).catch(error => {
                                console.log(error);
                                res.status(500).json({
                                    message: "Something went wrong!",
                                });
                            });
                        }
                    });
                } else {
                    res.status(401).json({
                        message: "Invalid credentials!",
                    });
                }
            });
        }
    }).catch(error => {
        res.status(500).json({
            message: "Something went wrong!",
        });
    });
}

function verifyOTP(req, res) {
    const { email, otp } = req.body;

    models.User.findOne({ where: { email: email } }).then(user => {
        if (!user) {
            res.status(404).json({
                message: "User not found!",
            });
        } else {
            if (user.otp === otp) {

                const token = jwt.sign({
                    email: user.email,
                    userId: user.id
                }, process.env.JWT_KEY, { expiresIn: '1h' });

                res.status(200).json({
                    message: "OTP verified successfully!",
                    token: token
                });
            } else {
                res.status(401).json({
                    message: "Invalid OTP!",
                });
            }
        }
    }).catch(error => {
        res.status(500).json({
            message: "Something went wrong!",
        });
    });
}

module.exports = {
    signUp: signUp,
    login: login,
    verifyOTP: verifyOTP
} 
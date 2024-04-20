const models = require('../models');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('fastest-validator');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');

//Employee signup
function signUp(req, res){
    models.Employee.findOne({where:{email:req.body.email}}).then(result => {
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

                    models.Employee.create(user).then(result => {
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

//Employee login
function login(req, res) {
    models.Employee.findOne({ where: { email: req.body.email } }).then(user => {
        if (user === null) {
            res.status(401).json({
                message: "Invalid credentials!",
            });
        } else {
            bcryptjs.compare(req.body.password, user.password, function (err, result) {
                if (result) {
                    const otp = Math.floor(1000 + Math.random() * 9000);

                    const transporter = nodemailer.createTransport({
                        host: process.env.EMAIL_HOST,
                        port: process.env.EMAIL_PORT,
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASS
                        }
                    });

                    const mailOptions = {
                        from: process.env.EMAIL_USER,
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

//Employee otp
function verifyOTP(req, res) {
    const { email, otp } = req.body;

    models.Employee.findOne({ where: { email: email } }).then(user => {
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

//Employee otp --when password change---
function verifyPasswordChangeOTP(req, res) {
    const { email, otp } = req.body;

    models.Employee.findOne({ where: { email: email } }).then(user => {
        if (!user) {
            res.status(404).json({
                message: "User not found!",
            });
        } else {
            if (user.otp === otp) {
                res.status(200).json({
                    message: "OTP verified successfully!",
                    email: user.email
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

//Employee forgot password
function forgotPassword(req, res) {
    const { email } = req.body;

    models.Employee.findOne({ where: { email: email } }).then(user => {
        if (!user) {
            res.status(404).json({
                message: "User not found!",
            });
        } else {
            const otp = Math.floor(1000 + Math.random() * 9000);

            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'OTP for Password Reset',
                text: `Your OTP for password reset is: ${otp}`
            };

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
        }
    }).catch(error => {
        res.status(500).json({
            message: "Something went wrong!",
        });
    });
}

//Employee change password
function changePassword(req, res) {
    const { email, newPassword } = req.body;

    const user = {
        password: req.body.newPassword 
    }
    
    const schema = {
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

    models.Employee.findOne({ where: { email: email } }).then(user => {
        if (!user) {
            return res.status(404).json({
                message: "User not found!",
            });
        }

        bcryptjs.genSalt(10, function(err, salt){
            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: "Error generating salt for hashing!",
                });
            }

            bcryptjs.hash(newPassword, salt, function(err, hash){
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        message: "Error hashing the password!",
                    });
                }
                
                user.update({ password: hash }).then(updatedUser => {
                    res.status(200).json({
                        message: "Password changed successfully!",
                    });
                }).catch(error => {
                    console.log(error);
                    res.status(500).json({
                        message: "Something went wrong while updating the password!",
                    });
                });
            });
        });
    }).catch(error => {
        console.log(error);
        res.status(500).json({
            message: "Something went wrong!",
        });
    });
}

// Employee controller functions

async function getAllEmployees(req, res) {
    try {
        // Fetch all employees from the database, including their assigned status
        const employees = await models.Employee.findAll({
            attributes: ['id', 'name','email','password','otp','nic','phone_no','commission_rate','current_location', 'assigned','profile_picture'], // Include only necessary fields
            raw: true // Get raw data instead of Sequelize instances
        });

        // If there are no employees found
        if (!employees || employees.length === 0) {
            return res.status(404).json({ message: "No employees found" });
        }

        // Return the fetched employees
        res.status(200).json({ employees: employees });
    } catch (error) {
        console.error("Error fetching employees:", error);
        res.status(500).json({ message: "Failed to fetch employees" });
    }
}



// Function to get employee details by ID
async function getEmployeeDetails(req, res) {
    try {
        const employeeId = req.params.employeeId;

        // Find the employee by ID in the database
        const employee = await models.Employee.findByPk(employeeId);

        // If employee with the given ID is not found
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        // If employee is found, return the details
        res.status(200).json({ employee: employee });
    } catch (error) {
        console.error("Error fetching employee details:", error);
        res.status(500).json({ message: "Failed to fetch employee details" });
    }
}

// Employee creation function
async function createEmployee(req, res) {
    try {
        // Check if the email already exists
        const existingEmployee = await models.Employee.findOne({ where: { email: req.body.email } });
        if (existingEmployee) {
            return res.status(409).json({ message: "Email already exists" });
        }

        // Define schema for employee data validation
        const employeeSchema = {
            name: { type: "string", optional: false },
            email: { type: "email", optional: false },
            password: { type: "string", optional: false, min: 8 }
            // Add more fields as needed
        };

        // Validate request body against schema
        const v = new validator();
        const validationResponse = v.validate(req.body, employeeSchema);
        if (validationResponse !== true) {
            return res.status(400).json({ message: "Validation failed", errors: validationResponse });
        }

        // Hash the password
        bcryptjs.genSalt(10, function(err, salt) {
            if (err) {
                return res.status(500).json({ message: "Error generating salt for hashing" });
            }
            bcryptjs.hash(req.body.password, salt, function(err, hash) {
                if (err) {
                    return res.status(500).json({ message: "Error hashing the password" });
                }

                // Create the employee
                models.Employee.create({
                    name: req.body.name,
                    email: req.body.email,
                    password: hash
                    // Add more fields as needed
                }).then(newEmployee => {
                    res.status(201).json({ message: "Employee created successfully", employee: newEmployee });
                }).catch(error => {
                    console.error("Error creating employee:", error);
                    res.status(500).json({ message: "Failed to create employee" });
                });
            });
        });
    } catch (error) {
        console.error("Error creating employee:", error);
        res.status(500).json({ message: "Failed to create employee" });
    }
}



module.exports = {
    signUp: signUp,
    login: login,
    verifyOTP: verifyOTP,
    forgotPassword:forgotPassword,
    verifyPasswordChangeOTP:verifyPasswordChangeOTP,
    changePassword:changePassword,
    getAllEmployees: getAllEmployees,
    getEmployeeDetails: getEmployeeDetails,
    createEmployee: createEmployee
} 
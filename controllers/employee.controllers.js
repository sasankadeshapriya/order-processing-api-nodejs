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
                password: req.body.password,
                nic: req.body.nic,
                phone_no: req.body.phone_no,
                commission_rate: req.body.commission_rate,
                added_by_admin_id: req.body.added_by_admin_id,
                current_location: req.body.current_location || null,
                assigned: req.body.assigned || false,
                profile_picture: req.body.profile_picture || null
            }
            
            const schema = {
                name: { type: "string", optional: false, max: 50, pattern: /^[a-zA-Z\s]+$/ },
                email: { type: "email", optional: false, max: 35 },
                password: { type: "string", optional: false, min: 8 },
                nic: { type: "string", optional: false }, 
                phone_no: { type: "string", optional: false },
                commission_rate: { type: "number", optional: false }, 
                added_by_admin_id: { type: "number", optional: false }, 
                current_location: { type: "string", optional: true }, 
                assigned: { type: "boolean", optional: true },
                profile_picture: { type: "string", optional: true }
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
            attributes: ['id','name','email','nic','phone_no','commission_rate','assigned','profile_picture'], // Include only necessary fields
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
        const employee = await models.Employee.findByPk(employeeId, {
            attributes: ['id', 'name', 'email', 'nic', 'phone_no', 'commission_rate', 'current_location', 'assigned', 'profile_picture'], // Include only necessary fields
            raw: true // Get raw data instead of Sequelize instances
        });

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

//update employee locations
async function updateEmployeeLocation(req, res) {
    try {
        const employeeId = req.params.employeeId;
        const locationData = req.body;

        console.log("Received location data:", locationData); // Debug print

        // Find the employee by ID in the database
        const employee = await models.Employee.findByPk(employeeId);

        console.log("Employee found:", employee); // Debug print

        // If employee with the given ID is not found
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        // Convert location data to JSON string
        const locationJsonString = JSON.stringify(locationData);

        console.log("Location JSON string:", locationJsonString); // Debug print

        // Update employee's current_location field with the provided location data
        employee.current_location = locationJsonString;

        console.log("Updated employee:", employee); // Debug print

        // Save the updated employee data
        await employee.save();

        console.log("Employee saved successfully."); // Debug print

        // Return success response
        res.status(200).json({ message: "Employee location updated successfully", employee: employee });
    } catch (error) {
        console.error("Error updating employee location:", error);
        res.status(500).json({ message: "Failed to update employee location" });
    }
}

async function getEmployeeLocation(req, res) {
    try {
        const employeeId = req.params.employeeId;

        // Find the employee by ID in the database
        const employee = await models.Employee.findByPk(employeeId);

        // If the employee with the given ID is not found
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        // Parse the location data from the stored JSON string
        const locationData = JSON.parse(employee.current_location);

        // Return the location data
        res.status(200).json({ location: locationData });
    } catch (error) {
        console.error("Error retrieving employee location:", error);
        res.status(500).json({ message: "Failed to retrieve employee location" });
    }
}

// Soft delete an employee by ID
async function deleteEmployee(req, res) {
    const employeeId = req.params.employeeId;
    try {
        const employee = await models.Employee.findByPk(employeeId);
        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        // Check if the employee is currently assigned to any assignment
        const activeAssignment = await models.Assignment.findOne({
            where: {
                employee_id: employeeId,
                deletedAt: null  // Ensure the assignment isn't already deleted
            }
        });

        if (activeAssignment) {
            return res.status(400).json({
                message: "Cannot delete employee because they are currently assigned to an assignment."
            });
        }

        // Soft delete the employee
        await employee.destroy();
        res.status(200).json({
            message: "Employee deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Something went wrong!"
        });
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
    updateEmployeeLocation: updateEmployeeLocation,
    getEmployeeLocation: getEmployeeLocation,
    deleteEmployee:deleteEmployee
}
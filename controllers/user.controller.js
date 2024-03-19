const models = require('../models');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('fastest-validator');

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

function login(req, res){
    models.User.findOne({where:{email: req.body.email}}).then(user => {
        if(user === null){
            res.status(401).json({
                message: "Invalid credentials!",
            });
        }else{
            bcryptjs.compare(req.body.password, user.password, function(err, result){
                if(result){
                    const token = jwt.sign({
                        email: user.email,
                        userId: user.id
                    }, process.env.JWT_KEY, function(err, token){
                        res.status(200).json({
                            message: "Authentication successful!",
                            token: token
                        });
                    });
                }else{
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


module.exports = {
    signUp: signUp,
    login: login
} 
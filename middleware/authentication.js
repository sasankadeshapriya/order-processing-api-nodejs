const jwt = require('jsonwebtoken');

//check token avilability - not check role
function authCheck(req, res, next){
    try{
        const token = req.headers.authorization.split(" ")[1]; 
        const decodedToken = jwt.verify(token, process.env.JWT_KEY);
        req.userData = decodedToken;
        next();
    }catch(e){
        return res.status(401).json({
            'message': "Invalid or expired token provided!",
            'error':e
        });
    }
}

//check token avilability with role: admin
function adminAuthCheck(req, res, next) {
    try {
        const token = req.headers.authorization.split(" ")[1]; 
        const decodedToken = jwt.verify(token, process.env.JWT_KEY);
        
        if (decodedToken.role === 'admin') {
            req.userData = decodedToken;
            next();
        } else {
            return res.status(403).json({
                'message': "Access forbidden! User is not an admin."
            });
        }
    } catch(e) {
        return res.status(401).json({
            'message': "Invalid or expired token provided!",
            'error': e
        });
    }
}

module.exports = {
    authCheck: authCheck,
    adminAuthCheck: adminAuthCheck
}
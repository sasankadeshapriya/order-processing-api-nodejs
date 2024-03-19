const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, cback){
        cback(null, './uploads');
    },
    filename: function(req, file, cback){
        cback(null, new Date().getTime() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cback) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cback(null, true);
    }else{
        cback(new Error('Unsupported files'), false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize:1024*1024*10
    },
    fileFilter:fileFilter
});

module.exports = {
    upload: upload
}
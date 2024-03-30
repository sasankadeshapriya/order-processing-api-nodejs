const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const userRoute = require('./routes/user');
const imageRoute = require('./routes/images');
const productRoute = require('./routes/product');

app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

app.use("/user", userRoute);
app.use("/images", imageRoute);
app.use("/products", productRoute);

app.get('/', (req, res) => {
    res.send('Server is working');
});

module.exports = app;
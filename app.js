const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const userRoute = require('./routes/user');
const imageRoute = require('./routes/images');

app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

app.use("/user", userRoute);
app.use("/images", imageRoute);

app.get('/', (req, res) => {
    res.send('Server is working');
});

module.exports = app;
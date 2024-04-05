const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const adminRoute = require('./routes/admin');
const employeeRoute = require('./routes/employee');
const imageRoute = require('./routes/images');
const vehicleRoute = require('./routes/vehicle');
const routeRoute = require('./routes/route');
const assignmentRoute = require('./routes/assignment');

app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

app.use("/admin", adminRoute);
app.use("/employee", employeeRoute);
app.use("/images", imageRoute);
app.use("/vehicle", vehicleRoute);
app.use("/route", routeRoute);
app.use("/assignment", assignmentRoute)

app.get('/', (req, res) => {
    res.send('Server is working');
});

module.exports = app;
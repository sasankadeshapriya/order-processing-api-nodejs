const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const adminRoute = require('./routes/admin');
const employeeRoute = require('./routes/employee');
const imageRoute = require('./routes/images');
const vehicleRoute = require('./routes/vehicle');
const routeRoute = require('./routes/route');
const assignmentRoute = require('./routes/assignment');
const productRoute = require('./routes/product');
const batchRoute = require('./routes/batch');
const commissionRoute = require('./routes/commission');
const clientRoute = require('./routes/client');

app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

app.use("/admin", adminRoute);
app.use("/employee", employeeRoute);
app.use("/images", imageRoute);
app.use("/vehicle", vehicleRoute);
app.use("/product", productRoute);
app.use("/batch", batchRoute);
app.use("/route", routeRoute);
app.use("/assignment", assignmentRoute);
app.use("/commission", commissionRoute);
app.use("/client", clientRoute);

app.get('/', (req, res) => {
    res.send('Server is working');
});

module.exports = app;
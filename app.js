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
const invoiceRoute = require('./routes/invoice');
const paymentRoute = require('./routes/payment');
const vehicleInventoryRoute = require('./routes/vehicleInventory');
const fetchDataRoute = require('./routes/fetchData');
const salesRoute = require('./routes/sales');
const outstandingRoute = require('./routes/outstanding');
const dayEndRoute = require('./routes/day-end-report');
const trashRoute = require('./routes/trash');

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
app.use("/invoice", invoiceRoute);
app.use("/payment", paymentRoute);
app.use("/vehicle-inventory", vehicleInventoryRoute);
app.use("/fetchdata", fetchDataRoute);
app.use("/sales", salesRoute);
app.use("/outstanding", outstandingRoute);
app.use("/day-report", dayEndRoute);
app.use("/trash", trashRoute);

app.get('/time', (req, res) => {
    res.send(new Date().toString());
});

app.get('/', (req, res) => {
    res.send('Server is working');
});

module.exports = app;
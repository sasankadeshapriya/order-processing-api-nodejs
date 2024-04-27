const express = require('express');
const fetchDataController = require('../controllers/fetchData.controller');
const checkAuthMiddleware = require('../middleware/authentication');

const router = express.Router();

router.get('/:employee_id/:assign_date', fetchDataController.fetchData);

module.exports = router;


/*
example: http://localhost:4000/fetchdata/3/2024-04-01

{
    "employee_name": "John Doe",
    "vehicle_inventory": [
        {
            "id": 1,
            "assignment_id": 1,
            "product_id": 1,
            "sku": "1234",
            "quantity": "10.00",
            "Product": {
                "id": 1,
                "name": "sasa",
                "product_code": "s4",
                "measurement_unit": "kg",
                "description": "ghhgh",
                "product_image": "http",
                "Batches": [
                    {
                        "sku": "1234",
                        "cash_price": "11.50",
                        "check_price": "11.50",
                        "credit_price": "12.50"
                    }
                ]
            }
        },
        {
            "id": 2,
            "assignment_id": 1,
            "product_id": 2,
            "sku": "xxx",
            "quantity": "10.00",
            "Product": {
                "id": 2,
                "name": "ghhgh",
                "product_code": "bn",
                "measurement_unit": "lb",
                "description": "bnn ",
                "product_image": "bhhhjh",
                "Batches": [
                    {
                        "sku": "xxx",
                        "cash_price": "11.50",
                        "check_price": "11.50",
                        "credit_price": "12.50"
                    }
                ]
            }
        },
        {
            "id": 3,
            "assignment_id": 1,
            "product_id": 2,
            "sku": "vvv",
            "quantity": "50.00",
            "Product": {
                "id": 2,
                "name": "ghhgh",
                "product_code": "bn",
                "measurement_unit": "lb",
                "description": "bnn ",
                "product_image": "bhhhjh",
                "Batches": [
                    {
                        "sku": "vvv",
                        "cash_price": "11.50",
                        "check_price": "11.50",
                        "credit_price": "12.50"
                    }
                ]
            }
        }
    ]
}

*/
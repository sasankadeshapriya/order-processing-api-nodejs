const models = require('../models');
const validator = require('fastest-validator');

//add product
async function insertProduct(req, res) {
    const productData = {
        name: req.body.name,
        product_code: req.body.product_code,
        measurement_unit: req.body.measurement_unit,
        description: req.body.description,
        product_image: req.body.product_image,
        added_by_admin_id: req.body.added_by_admin_id
    };

    const schema = {
        name: { type: "string", optional: false, min:2, max: 50 },
        product_code: { type: "string", optional: false },
        measurement_unit: { type: "enum", values: ['pcs', 'kg', 'lb', 'g'], optional: false },
        description: { type: "string", optional: true },
        product_image: { type: "string", optional: true },
        added_by_admin_id: { type: "number", optional: false }
    };

    const validatorInstance = new validator();
    const validationResponse = validatorInstance.validate(productData, schema);

    if (validationResponse !== true) {
        return res.status(400).json({
            message: "Validation failed",
            error: validationResponse
        });
    }

    try {
        // Check if the product with the same product_code already exists
        const existingProduct = await models.Product.findOne({ where: { product_code: productData.product_code } });
        if (existingProduct) {
            return res.status(409).json({
                message: "Product with the same product_code already exists"
            });
        }

        // Check if the provided measurement_unit is valid
        if (!schema.measurement_unit.values.includes(productData.measurement_unit)) {
            return res.status(400).json({
                message: "Invalid measurement_unit"
            });
        }

        // Create the new product
        const newProduct = await models.Product.create(productData);
        res.status(201).json({
            message: "Product created successfully",
            product: newProduct
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Something went wrong!"
        });
    }
}

//update product
async function updateProduct(req, res) {
    const productId = req.params.productId;
    const updatedProductData = {
        name: req.body.name,
        measurement_unit: req.body.measurement_unit,
        description: req.body.description,
        product_image: req.body.product_image,
    };

    const schema = {
        name: { type: "string", optional: false, min: 3, max: 50 },
        measurement_unit: { type: "enum", values: ['pcs', 'kg', 'lb', 'g'], optional: false },
        description: { type: "string", optional: true },
        product_image: { type: "string", optional: true },
    };

    const validatorInstance = new validator();
    const validationResponse = validatorInstance.validate(updatedProductData, schema);

    if (validationResponse !== true) {
        return res.status(400).json({
            message: "Validation failed",
            error: validationResponse
        });
    }

    try {
        // Create the new product
        const product = await models.Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
        
        // Update the product
        await product.update(updatedProductData);

        res.status(200).json({
            message: "Product updated successfully",
            product: product
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Something went wrong!"
        });
    }
}

//delete a product
async function deleteProduct(req, res) {
    const productId = req.params.productId;

    try {
        const product = await models.Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Check if there are any looked vehicle inventories related to this product
        const lockedInventories = await models.Vehicle_inventory.findOne({
            where: {
                product_id: productId,
                looked: true  // Check for locked inventories
            }
        });

        if (lockedInventories) {
            return res.status(400).json({
                message: "Cannot delete product because it has locked inventories."
            });
        }
                
        // Soft delete related batches and vehicle inventories
        await models.Batch.update({ deletedAt: new Date() }, { where: { product_id: productId } });
        await models.Vehicle_inventory.update({ deletedAt: new Date() }, { where: { product_id: productId } });

        await product.destroy();
        res.status(200).json({
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Something went wrong!"
        });
    }
}

//get all products
async function getAllProducts(req, res) {
    try {
        const products = await models.Product.findAll();
        res.status(200).json(products);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Something went wrong!"
        });
    }
}

//get a specific product by ID
async function getProductById(req, res) {
    const productId = req.params.productId;

    try {
        const product = await models.Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
        res.status(200).json(product);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Something went wrong!"
        });
    }
}

module.exports = {
    insertProduct:insertProduct,
    updateProduct:updateProduct,
    deleteProduct:deleteProduct,
    getAllProducts:getAllProducts,
    getProductById:getProductById
}
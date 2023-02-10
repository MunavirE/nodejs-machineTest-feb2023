var express = require('express');
var app = express();
var fs = require("fs");
const multer = require("multer");
const path = require("path");
const bodyParser = require('body-parser')

const mongoose = require('mongoose');
require('dotenv').config();

const mongoString = process.env.DATABASE_URL


mongoose.connect(mongoString);
const database = mongoose.connection

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})

/**
 * Storage for images  file uploading
 */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./upload/images");
    },

    filename: function (req, file, cb) {
        return cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        //validating file type
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
})

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/productImage', express.static('upload/images'));

//Add product -POST
app.post("/api/v1/product", upload.array('images'), (req, res) => {
    //reading product details from DB
    let newProductDetails = req.body
    //File read from request and uplo
    if (req.files.length > 0) {
        upload.array('images')
        newProductDetails.imageUrl = `http://localhost:8080/productImage/${req.files[0].filename}`
    }
    //calculating price 
    newProductDetails.price = Number(req.body.mrp) - (Number(req.body.discount) + Number(req.body.shippingCharge))
    //read data from product json file
    let productDataTxt = fs.readFileSync('products.json')
    let productData = JSON.parse(productDataTxt)
    //loop through the product to check the product with same id exist
    productData.map(productItem => {
        if (productItem.productId == newProductDetails.productId) {
            res.status(400).send("product already exists with same Id")
        }
    })
    //new product details add to the product List
    productData.push(newProductDetails)
    //write to product JSON file
    fs.writeFile(__dirname + "/" + "products.json", JSON.stringify(productData), err => {
        if (err)
            console.error(err)
    })
    res.status(201).send(newProductDetails)
})

//Update or edit product details -PUT
app.put("/api/v1/product", upload.array('images'), (req, res) => {
    let newUpdatedProduct = {}
    let valuesToUpdate = req.body;
    // console.log(valuesToUpdate)
    //Reading data from product json file
    let productDataTxt = fs.readFileSync('products.json')
    let productData = JSON.parse(productDataTxt)
    //loop through the product to get the product match
    for (i = 0; i < productData.length; i++) {
        if (productData[i].productId == valuesToUpdate.productId) {
            //Copying the existing product with the updated details
            newUpdatedProduct = Object.assign(productData[i], valuesToUpdate)
            if (req.files.length > 0) {
                newUpdatedProduct.imageUrl = `http://localhost:8080/productImage/${req.files[0].filename}`
            }
            //calculating price 
            newUpdatedProduct.price = Number(newUpdatedProduct.mrp) - (Number(newUpdatedProduct.discount) + Number(newUpdatedProduct.shippingCharge))
            //replace the existing product with the new updated product
            productData.splice(i, 1, newUpdatedProduct)
            //write to a file
            fs.writeFile(__dirname + "/" + "products.json", JSON.stringify(productData), err => {
                if (err)
                    console.error(err)
            })
            //return response with updated details
            res.send(newUpdatedProduct)
        }
    }
    res.status(404).send("No data found")
})

//delete the product -DELETE
app.delete("/api/v1/product/:productId", (req, res) => {
    let id = req.params.productId
    let productDataTxt = fs.readFileSync('products.json')
    let productData = JSON.parse(productDataTxt)
    //loop through the product to check the product id to delete
    for (i = 0; i < productData.length; i++) {
        if (productData[i].productId == id) {
            //check imageUrl present in product data
            if (productData[i].hasOwnProperty("imageUrl")) {
                let imageFileName = productData[i].imageUrl.split('/').pop()
                //delete image file from the directory
                fs.unlink("./upload/images" + imageFileName, err => {
                    if (err) { console.error(err) }
                })
            }
            //removing the product from the product list
            productData.splice(i, 1)
            fs.writeFile(__dirname + "/" + "products.json", JSON.stringify(productData), err => {
                if (err)
                    console.error(err)
            })
            res.send("Deleted the product with id " + id)
        } 
    }
    res.end()
})

//get the specific product by Id -GET
app.get("/api/v1/product/:productId", (req, res) => {
    let id = req.params.productId
    let productDataTxt = fs.readFileSync('products.json')
    let productData = JSON.parse(productDataTxt)
    productData.map(productItem => {
        if (productItem.productId == id) {
            res.send(productItem)
        }
    })
    res.sendStatus(204)
})

//List all the products -GET
app.get("/api/v1/products", (req, res) => {
    let productDataTxt = fs.readFileSync('products.json')
    let productData = JSON.parse(productDataTxt)
    res.send(productData)
})

let port = 8080
app.listen(port, () => {
    console.log(`Running at localhost:${port}`);
})
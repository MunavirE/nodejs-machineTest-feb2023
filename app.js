var express = require('express');
var app = express();
var fs = require("fs");
const multer = require("multer");
const path = require("path");
const bodyParser = require('body-parser')

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
app.post("/product", (req, res) => {
    //reading product details from DB
    let newProductDetails = req.body
    //File read from request and uplo
    if (req.file) {
        upload.array('images')
        newProductDetails.imageUrl = `http://localhost:8080/productImage/${req.file.filename}`
    }
    //calculating price 
    newProductDetails.price = req.body.mrp - (req.body.discount + req.body.shippingCharge)
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
app.put("/product", (req, res) => {
    let newUpdatedProduct = {}
    let valuesToUpdate = req.body;
    //Reading data from product json file
    let productDataTxt = fs.readFileSync('products.json')
    let productData = JSON.parse(productDataTxt)
    //loop through the product to get the product match
    for (i = 0; i < productData.length; i++) {
        if (productData[i].productId == valuesToUpdate.productId) {
            //Copying the existing product with the updated details
            newUpdatedProduct = Object.assign(productData[i], valuesToUpdate)
            if (req.file) {
                upload.array('images')
                newUpdatedProduct.imageUrl = `http://localhost:8080/productImage/${req.file.filename}`
            }
            //calculating price 
            newUpdatedProduct.price = newUpdatedProduct.mrp - (newUpdatedProduct.discount + newUpdatedProduct.shippingCharge)
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
        else {
            res.status(404).send("No data found")
        }
    }
    productData.map((productItem) => {
        if (productItem.productId == valuesToUpdate.productId) {
            //Copying the existing product with the updated details
            newUpdatedProduct = Object.assign(productItem, valuesToUpdate)
            if (req.file) {
                upload.array('images')
                newUpdatedProduct.imageUrl = `http://localhost:8080/productImage/${req.file.filename}`
            }
            //calculating price 
            newUpdatedProduct.price = newUpdatedProduct.mrp - (newUpdatedProduct.discount + newUpdatedProduct.shippingCharge)

            //write to a file
            fs.writeFile(__dirname + "/" + "products.json", JSON.stringify(productData), err => {
                if (err)
                    console.error(err)
            })
            //return response with updated details
            res.send(newUpdatedProduct)
        }
        else {
            res.status(404).send("No data found")
        }
    })
    res.end()
})

//delete the product -DELETE
app.delete("/product/:productId", (req, res) => {
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
        } else {
            res.status(404).send("No data found")
        }
    }
    res.end()
})

//get the specific product by Id -GET
app.get("/product/:productId", (req, res) => {
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
app.get("/products", (req, res) => {
    let productDataTxt = fs.readFileSync('products.json')
    let productData = JSON.parse(productDataTxt)
    res.send(productData)
})

let port = 8080
app.listen(port, () => {
    console.log(`Running at localhost:${port}`);
})
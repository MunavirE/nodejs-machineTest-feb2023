var express = require('express');
var app = express();
var fs = require("fs");
const multer = require("multer");
const path = require("path");
const bodyParser = require('body-parser')


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
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
})

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/productImage', express.static('upload/images'));
app.post("/product", (req, res) => {
    let newProductDetails = req.body
    if (req.file) {
        // console.log(req.file)
        upload.single('image')
        newProductDetails.imageUrl = `http://localhost:4000/productImage/${req.file.filename}`
    }
    newProductDetails.price = req.body.mrp - (req.body.discount + req.body.shippingCharge)
    let productDataTxt = fs.readFileSync('products.json')
    let productData = JSON.parse(productDataTxt)
    productData.map(productItem=>{
        if(productItem.productId==newProductDetails.productId){
            res.status(400).send("product already exists with same Id")
        }
    })
    productData.push(newProductDetails)
    fs.writeFile(__dirname + "/" + "products.json", JSON.stringify(productData), err => {
        if (err)
            console.error(err)
    })
    res.status(201).send(newProductDetails)
})

app.put("/product", (req, res) => {
    let newUpdatedProduct = {}
    let valuesToUpdate = req.body;
    if (req.file) {
        // console.log(req.file)
        upload.single('image')
        newProductDetails.imageUrl = `http://localhost:4000/productImage/${req.file.filename}`
    }
    let productDataTxt = fs.readFileSync('products.json')
    let productData = JSON.parse(productDataTxt)
    productData.map((productItem) => {
        if (productItem.productId == valuesToUpdate.productId) {
            newUpdatedProduct = Object.assign(productItem, valuesToUpdate)
            if (req.file) {
                // console.log(req.file)
                upload.single('image')
                newUpdatedProduct.imageUrl = `http://localhost:4000/productImage/${req.file.filename}`
            }
            fs.writeFile(__dirname + "/" + "products.json", JSON.stringify(productData), err => {
                if (err)
                    console.error(err)
            })
            res.send(newUpdatedProduct)
        }
        else{
            res.staus(404).send("No data found")
        }
    })
    res.send(newUpdatedProduct)
})

app.delete("/product/:productId", (req, res) => {
    let id = req.params.productId
    let productDataTxt = fs.readFileSync('products.json')
    let productData = JSON.parse(productDataTxt)
    for (i = 0; i < productData.length; i++) {
        if (productData[i].productId == id) {
            if (productData[i].hasOwnProperty("imageUrl")) {
                let imageFileName = productData[i].imageUrl.split('/').pop()
                fs.unlink("./upload/images" + imageFileName, err => {
                    if (err) { console.error(err) }
                })
            }
            productData.splice(i, 1)
            fs.writeFile(__dirname + "/" + "products.json", JSON.stringify(productData), err => {
                if (err)
                    console.error(err)
            })
            res.send("Deleted the product with id " + id)
        }else{
            res.status(404).send("No data found")
        }
    }
    res.end()
})

app.listen(4000, () => {
    console.log("Running.................")
})
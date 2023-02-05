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
    productData.push(newProductDetails)
    fs.writeFile(__dirname + "/" + "products.json", JSON.stringify(productData), err => {
        if (err)
            console.error(err)
    })
    res.send(req.body)
})

app.listen(4000, () => {
    console.log("Running.................")
})
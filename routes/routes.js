const express = require('express');
const router = express.Router()
const Model = require('../model/model');
const multer = require("multer");
const path = require("path");
const fs = require("fs")
module.exports = router;


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



//Post Method
router.post('/post', upload.array('images'), async (req, res) => {

    const data = new Model({
        name: req.body.name,
        description: req.body.description,
        mrp: req.body.mrp,
        discount: req.body.discount,
        shippingCharge: req.body.shippingCharge,
    })
    let discount = req.body.discount
    let shippingCharge = req.body.shippingCharge
    if (discount == undefined) {
        discount = 0;
    }
    if (shippingCharge === undefined) {
        shippingCharge = 0;
    }
    // console.log(data)
    data.price = Number(Number(req.body.mrp) - discount + shippingCharge)
    console.log(req.files.length)
    //File read from request and uplo
    if (req.files.length > 0) {
        upload.array('images')
        let imageUrlList = []
        req.files.map(imageItem => {
            imageUrlList.push(`http://localhost:8080/productImage/${imageItem.filename}`)
        })
        data.imageUrl = imageUrlList;
    }
    try {
        let duplicateProductName = await Model.find({ name: data.name });
        if (duplicateProductName.length > 0) {
            res.status(409).json({ message: `Already Exist the product with name: ${data.name}` });
        } else {
            const dataToSave = await data.save();
            res.status(200).json(dataToSave)
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

//Get all Method
router.get('/getAll', async (req, res) => {
    try {
        const data = await Model.find();
        res.json(data)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//Get by ID Method
router.get('/getOne/:id', async (req, res) => {
    try {
        const data = await Model.findById(req.params.id);
        res.json(data)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//Update by ID Method
router.patch('/update/:id', upload.array('images'), async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;
        const options = { new: true };
        //File read from request and uplo
        if (req.files.length > 0) {
            upload.array('images')
            let imageUrlList = []
            req.files.map(imageItem => {
                imageUrlList.push(`http://localhost:8080/productImage/${imageItem.filename}`)
            })
            updatedData.imageUrl = imageUrlList;
        }
        //calculating product price
        if (req.body.mrp != undefined || req.body.discount != undefined || req.body.shippingCharge != undefined) {
            let mrp, discount, shippingCharge;
            const productData = await Model.findById(id);
            if (req.body.mrp == undefined) {
                mrp = productData.mrp
            } else {
                mrp = req.body.mrp
            }
            if (req.body.discount == undefined) {
                discount = productData.discount;
            } else {
                discount = req.body.discount
            }
            if (req.body.shippingCharge == undefined) {
                shippingCharge = productData.shippingCharge;
            } else {
                shippingCharge = req.body.shippingCharge
            }
            updatedData.price = Number(mrp) - (Number(discount) + Number(shippingCharge))
            console.log(updatedData)
        }
        const result = await Model.findByIdAndUpdate(
            id, updatedData, options
        )
        res.send(result)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

//Delete by ID Method
router.delete('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Model.findByIdAndDelete(id)
        console.log(data)

        if (data != null) {
            if (data.hasOwnProperty("imageUrl")) {
                data.imageUrl.map(item => {
                    let imageFileName = item.split('/').pop()
                    //delete image file from the directory
                    fs.unlink("./upload/images" + imageFileName, err => {
                        if (err) { throw err }
                    })
                })
            }
            res.send(`Document with ${data.name} has been deleted..`)
        } else {
            res.status(404).send(`No data found with id :${id}`)
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})
# nodejs-machineTest-feb2023


## products.json
================================================================
- It contains the list of products
- Create , Read , Update , Delete and List the product based on the product json file
- It array of product objects
- product's attributes are 
    - productId  //indexId
    - name
    - description
    - price //mrp-(discount+shippingCharge)
    - mrp
    - discount 
    - shippingCharge
    - imageUrl

API
================================================================
- POST http://localhost:8080/api/v1/product 
- PUT http://localhost:8080/api/v1/product
- GET http://localhost:8080/api/v1/product/:productId
- GET  http://localhost:8080/api/v1/products
- DELETE  http://localhost:8080/api/v1/product/:productId


Note: the images are uploaded in the folder (./upload/images)
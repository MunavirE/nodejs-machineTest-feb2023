# nodejs-machineTest-feb2023

API
================================================================
- POST http://localhost:8080/api/v1/product 
- PATCH http://localhost:8080/api/v1/product/:id
- GET http://localhost:8080/api/v1/product/:id
- GET  http://localhost:8080/api/v1/products
- DELETE  http://localhost:8080/api/v1/product/:id

### index.js
================================================================
- It is the server side of the application

### model/model.js
================================================================
- It contains the product schema to store in the mongodb data base

### routes/route.js
================================================================
- The API path and routes (controller file) are implemented in routes.js file 

### upload/images
================================================================
- The product image is uploaded in this folder

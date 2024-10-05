require('dotenv').config();
require('express-async-errors');

//express
const express = require('express');
const app = express();

// Packages 
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');



//database
const connectDB = require('./database/connect');

// routes
const productRouter = require('./routes/productRoutes');


//middlewares
const notFoundMiddleware = require('./middlewares/not-found');
const errorHandlerMiddleware = require('./middlewares/error-handler');


app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(fileUpload());

app.use('/api/v1/products', productRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);


const port = process.env.PORT || 8080;
const start = async () => {
    try{
        await connectDB(process.env.MONGO_URI);
        app.listen(port, () => 
        console.log(`server is listening on port ${port}...`));
    }
    catch(error){
        console.log(error);
    }
};


start();






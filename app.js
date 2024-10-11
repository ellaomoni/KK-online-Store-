require("dotenv").config();
require("express-async-errors");

//express
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

// Packages
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");


//database
const connectDB = require("./database/connect");

// routes
const productRouter = require("./routes/productRoutes");
const ordersRouter = require("./routes/ordersRoute");
const adminRouter = require("./routes/adminRoutes");

//middlewares
const notFoundMiddleware = require("./middlewares/not-found");
const errorHandlerMiddleware = require("./middlewares/error-handler");

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);

app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());


// app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser(process.env.JWT_SECRET));
// app.use(fileUpload());

app.use("/api/v1/products", productRouter);
app.use("/api/v1/orders", ordersRouter);
app.use("/api/v1/admin", adminRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 8080;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();

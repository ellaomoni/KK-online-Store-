const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../productImages");

//for file upload
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Use the defined upload directory
  },
  filename: (req, file, cb) => {
    const { name, productCollection } = req.body;

    // Sanitize the product name and collection for file naming
    const sanitizedProductName = name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const sanitizedCollection = productCollection
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();

    // Construct the file name using the product name and collection
    const fileName = `${sanitizedProductName}_${sanitizedCollection}${path.extname(
      file.originalname
    )}`;

    cb(null, fileName);
  },
});

const upload = multer({ storage });

const createProduct = async (req, res) => {
  try {
    const {
      name,
      productCollection,
      description,
      price,
      color,
      availableSizes,
      quantitySelector,
      altText,
    } = req.body;

    const imagePath = req.file.path;
    const sanitizedProductName = name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const sanitizedCollection = productCollection
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();

    const formattedFilename = `${sanitizedProductName}-${sanitizedCollection}${path.extname(
      req.file.originalname
    )}`;
    const productImageUrl = `/productImages/${formattedFilename}`; // Construct the image URL

    const product = await Product.create({
      name,
      productCollection,
      description,
      price,
      color,
      availableSizes: JSON.parse(availableSizes),
      quantitySelector: JSON.parse(quantitySelector),
      productImage: {
        data: imagePath,
        contentType: req.file.mimetype,
        altText: altText,
        productImageUrl: productImageUrl,
      },
    });

    res.status(StatusCodes.CREATED).json({
      product: {
        ...product.toObject(),
      },
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error creating product",
      error: error.message,
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});

    const formattedProducts = products.map((product) => ({
      _id: product._id,
      name: product.name,
      productCollection: product.productCollection,
      description: product.description,
      price: product.price,
      color: product.color,
      availableSizes: product.availableSizes,
      quantitySelector: product.quantitySelector,
      productImage: {
        productImageUrl: product.productImage.productImageUrl,
        //i cannot return base64
        // image: product.productImage.data,
        altText: product.productImage.altText,
      },
    }));

    res
      .status(StatusCodes.OK)
      .json({ products: formattedProducts, count: products.length });
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: 500,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const getSingleProduct = async (req, res) => {
  try {
    const { id: productId } = req.params;

    const product = await Product.findById({ _id: productId });

    if (!product) {
      throw new CustomError(
        `No Product with id : ${productId}`,
        StatusCodes.NOT_FOUND
      );
    }

    const formattedProduct = {
      _id: product._id,
      name: product.name,
      productCollection: product.productCollection,
      description: product.description,
      price: product.price,
      color: product.color,
      availableSizes: product.availableSizes,
      quantitySelector: product.quantitySelector,
      productImage: {
        productImageUrl: product.productImage.productImageUrl,
        altText: product.productImage.altText,
      },
    };

    return res.status(StatusCodes.OK).json({
      status: 200,
      message: "Product retrieved successfully",
      product: formattedProduct,
    });
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: 500,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const updateProduct = async (req, res) => {
  const { id: productId } = req.params;

  const updatedProduct = await Product.findByIdAndUpdate(
    { _id: productId },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedProduct) {
    throw new CustomError(
      `No Product with id : ${productId}`,
      StatusCodes.NOT_FOUND
    );
  }
};

const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;

  const deletedProduct = await Product.findById({ _id: productId });
  if (!deletedProduct) {
    throw new CustomError(
      `No Product with id : ${productId}`,
      StatusCodes.NOT_FOUND
    );
  }
};

const uploadProductImage = async (req, res) => {
  if (!req.files || !req.files.image) {
    throw new CustomError.BadRequestError("No file uploaded");
  }

  const productImage = req.files.image;

  // Validate that the file is an image
  if (!productImage.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("Please upload an image");
  }

  // Check file size (limit to 1MB)
  const maxSize = 1024 * 1024;
  if (productImage.size > maxSize) {
    throw new CustomError.BadRequestError(
      "Please upload an image smaller than 1MB"
    );
  }

  // Store the binary data of the image in the database
  const newProduct = await Product.create({
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    productImage: {
      data: productImage.data, // Binary data of the image
      contentType: productImage.mimetype, // MIME type (e.g., 'image/jpeg')
      altText: req.body.altText, // Alt text provided by the user
    },
  });

  res.status(201).json({ product: newProduct });
};

const getProductImage = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product || !product.productImage || !product.productImage.data) {
    throw new CustomError.NotFoundError("Product or image not found");
  }

  res.set("Content-Type", product.productImage.contentType);
  res.send(product.productImage.data); // Send the binary data
};
const updateProductImage = async (req, res) => {
  const { id: productId } = req.params;

  // Find the product by ID
  const product = await Product.findById(productId);
  if (!product) {
    throw new CustomError.NotFoundError(
      `No product found with id: ${productId}`
    );
  }

  // Check if the new image file is uploaded
  if (!req.files || !req.files.image) {
    throw new CustomError.BadRequestError("No file uploaded");
  }

  const productImage = req.files.image;

  // Validate that the uploaded file is an image
  if (!productImage.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("Please upload an image");
  }

  // Check the file size (limit to 1MB)
  const maxSize = 1024 * 1024;
  if (productImage.size > maxSize) {
    throw new CustomError.BadRequestError(
      "Please upload an image smaller than 1MB"
    );
  }

  // Update the product image with the new binary data, content type, and alt text
  product.productImage = {
    data: productImage.data,
    contentType: productImage.mimetype,
    altText: req.body.altText || product.productImage.altText, // Use new altText if provided, else keep the old one
  };

  await product.save(); // Save the updated product in the database

  res
    .status(200)
    .json({ message: "Product image updated successfully", product });
};
// Delete Product Image
const deleteProductImage = async (req, res) => {
  const { id: productId } = req.params;

  // Find the product by ID
  const product = await Product.findById(productId);
  if (!product) {
    throw new CustomError.NotFoundError(
      `No product found with id: ${productId}`
    );
  }

  // If there's no image associated with the product, return an error
  if (!product.productImage || !product.productImage.data) {
    throw new CustomError.BadRequestError("No image found for this product");
  }

  // Remove the image data and metadata from the product
  product.productImage = {
    data: null,
    contentType: null,
    altText: null,
  };

  await product.save(); // Save the product without the image

  res.status(200).json({ message: "Product image deleted successfully" });
};

module.exports = {
  upload,
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  getProductImage,
  updateProductImage,
  deleteProductImage,
};

const Product = require('../models/Product');
const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const path = require('path');

const createProduct = async (req, res) => {
    req.body.user = req.user.userId;
    const product = await Product.create(req.body);
    res.status(StatusCodes.CREATED).JSON({product});
};

const getAllProducts = async (req, res) => {
    const products = await Product.find({});

    res.status(StatusCodes.OK).json({products, count: products.length});
};

const getSingleProduct = async (req, res) => {
    const { id: productId } = req.params;

    const product = await Product.findById({_id: productId})

    if (!product) {
        throw new CustomError(`No Product with id : ${productId}`, StatusCodes.NOT_FOUND);
    }
};

const updateProduct = async (req, res) => {
    const {id: productId} = req.params;

    const updatedProduct = await Product.findByIdAndUpdate({_id: productId} , req.body,{
        new: true,
        runValidators: true,
    });

    if (!updatedProduct) {
        throw new CustomError(`No Product with id : ${productId}`, StatusCodes.NOT_FOUND);
    }
};

const deleteProduct = async (req, res) => {
    const {id : productId} = req.params;

    const deletedProduct = await Product.findById({_id: productId});
    if (!deletedProduct) {
        throw new CustomError(`No Product with id : ${productId}`, StatusCodes.NOT_FOUND);
    }

};

const uploadProductImage = async (req, res) => {
    if (!req.files) {
        throw new CustomError.BadRequestError('No file uploaded', StatusCodes.BAD_REQUEST);
    }

    const productImage = req.files.image;

    if (!productImage.mimetype.startsWith('image')) {
        throw new CustomError.BadRequestError('Invalid file type. Please Upload Image', StatusCodes.BAD_REQUEST);
    }

    const maxSize = 1024 * 1024;

    if (productImage.size > maxSize) {
        throw new CustomError.BadRequestError('File size is too large. Please upload file less than 1MB', StatusCodes.BAD_REQUEST);
    }

    const imagePath = path.join(
    __dirname,
    '' + `${productImage.name}`
  );
  await productImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ image: `${productImage.name}` });

};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
};


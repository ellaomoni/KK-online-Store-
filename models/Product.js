const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    productCollection: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    color: { type: String, required: true },
    availableSizes: [{ type: String, required: true }],
    quantitySelector: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 99 },
      default: { type: Number, default: 1 },
    },
    productImage: {
      data: { type: Buffer, required: false }, // BLOB to store the binary data of the image
      contentType: { type: String, required: false }, // MIME type of the image (e.g., 'image/jpeg')
      altText: { type: String, required: false },
      productImageUrl: { type: String, required: false },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);

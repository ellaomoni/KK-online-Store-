const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  productCollection: { type: String, required: true },  
  description: { type: String, required: true },
  price: { type: Number, required: true },
  color: { type: String, required: true },
  availableSizes: [{ type: String, required: true }],
  quantitySelector: {
    min: { type: Number, default: 1 },
    max: { type: Number, default: 99 },
    default: { type: Number, default: 1 }
  },
  //use blob for image 
  productImage: { 
    url: { type: String, required: true },  
    altText: { type: String, required: true } 
  }
},{
  timestamps: true,
}
);

module.exports = mongoose.model('Product', productSchema);

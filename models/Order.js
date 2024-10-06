const mongoose = require('mongoose');

const SingleOrderItemSchema = mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  amount: { type: Number, required: true },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true,
  },
});

const AddressSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  zipCode: { type: String, required: true },
  mobileNumber: { type: String, required: true },
});

const PaymentSchema = new mongoose.Schema({
  method: { type: String, enum: ['Direct bank transfer', 'Visa', 'Mastercard', 'Stripe'], required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  transactionId: { type: String }, // Store transaction ID for successful payments
});

const OrderSchema = new mongoose.Schema(
  {
    items: [SingleOrderItemSchema],
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    total: { type: Number, required: true },

    billingAddress: { type: AddressSchema, required: true },
    shippingAddress: { type: AddressSchema, required: true },

    paymentInfo: { type: PaymentSchema, required: true },

    orderStatus: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered'], default: 'pending' },
    orderDate: { type: Date, default: Date.now },

    customerNote: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);

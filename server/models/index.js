const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─── USER ───────────────────────────────────────────────
const userSchema = new Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  role:      { type: String, enum: ['admin', 'client'], default: 'client' },
  avatar:    { type: String, default: '' }
}, { timestamps: true });

// ─── ANIMAL ─────────────────────────────────────────────
const animalSchema = new Schema({
  name:        { type: String, required: true },
  type:        { type: String, enum: ['cow', 'sheep', 'chicken', 'rabbit', 'other'], required: true },
  birth_date:  { type: Date },
  description: { type: String },
  status:      { type: String, enum: ['available', 'sold'], default: 'available' },
  // for selling the animal itself
  for_sale:    { type: Boolean, default: false },
  sale_price:  { type: Number },
  sale_age:    { type: String },
  sale_weight: { type: Number },
  images:      [{ type: String }]
}, { timestamps: true });

// ─── ANIMAL LOG ─────────────────────────────────────────
const animalLogSchema = new Schema({
  animal_id:   { type: Schema.Types.ObjectId, ref: 'Animal', required: true },
  type:        { type: String, enum: ['food', 'health'], required: true },
  description: { type: String, required: true },
  date:        { type: Date, default: Date.now }
});

// ─── PRODUCT ─────────────────────────────────────────────
const productSchema = new Schema({
  animal_id:  { type: Schema.Types.ObjectId, ref: 'Animal', required: true },
  name:       { type: String, required: true },   // e.g. Milk, Eggs, Meat
  price:      { type: Number, required: true },
  unit:       { type: String, enum: ['kg', 'liter', 'unit'], required: true },
  options:    { type: Schema.Types.Mixed },        // { type: 'Milk/Lben', quantity: 1 }
  stock:      { type: Number, default: 0 },
  image:      { type: String }
}, { timestamps: true });

// ─── PROMOTION ───────────────────────────────────────────
const promotionSchema = new Schema({
  product_id:          { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  discount_percentage: { type: Number, required: true, min: 1, max: 99 },
  start_date:          { type: Date, required: true },
  end_date:            { type: Date, required: true },
  active:              { type: Boolean, default: true }
}, { timestamps: true });

// ─── ORDER ───────────────────────────────────────────────
const orderItemSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product' },
  animal_id:  { type: Schema.Types.ObjectId, ref: 'Animal' },
  quantity:   { type: Number, default: 1 },
  price:      { type: Number, required: true },
  item_type:  { type: String, enum: ['product', 'animal'], required: true }
});

const orderSchema = new Schema({
  user_id:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items:       [orderItemSchema],
  total_price: { type: Number, required: true },
  status:      { type: String, enum: ['pending', 'confirmed', 'delivered', 'cancelled'], default: 'pending' },
  note:        { type: String }
}, { timestamps: true });

// ─── COMMENT ─────────────────────────────────────────────
const commentSchema = new Schema({
  user_id:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  animal_id: { type: Schema.Types.ObjectId, ref: 'Animal', required: true },
  text:      { type: String, required: true },
  rating:    { type: Number, min: 1, max: 5, required: true }
}, { timestamps: true });

// ─── MESSAGE ─────────────────────────────────────────────
const messageSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text:    { type: String, required: true },
  sender:  { type: String, enum: ['admin', 'client'], required: true },
  read:    { type: Boolean, default: false }
}, { timestamps: true });

// ─── NOTIFICATION ────────────────────────────────────────
const notificationSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type:    { type: String, enum: ['promotion', 'order', 'message'], required: true },
  text:    { type: String, required: true },
  read:    { type: Boolean, default: false }
}, { timestamps: true });

module.exports = {
  User:         mongoose.model('User',         userSchema),
  Animal:       mongoose.model('Animal',       animalSchema),
  AnimalLog:    mongoose.model('AnimalLog',    animalLogSchema),
  Product:      mongoose.model('Product',      productSchema),
  Promotion:    mongoose.model('Promotion',    promotionSchema),
  Order:        mongoose.model('Order',        orderSchema),
  Comment:      mongoose.model('Comment',      commentSchema),
  Message:      mongoose.model('Message',      messageSchema),
  Notification: mongoose.model('Notification', notificationSchema),
};

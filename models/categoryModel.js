const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Category must have a name'], unique: true },
    description: {
        type: String,
        trim: true
    },
    imageCover: { type: String },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now()
    },
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
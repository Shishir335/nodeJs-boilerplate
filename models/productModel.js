const mongoose = require('mongoose');
// const Category = require("./categoryModel");

const productSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Product must have a name'], unique: true },
    size: { type: String, default: "M" },
    price: { type: Number, required: [true, 'Product must have a price'] },
    color: String,
    summery: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'Must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    ratingsAverage: {
        type: Number,
        default: 5,
        min: [1, 'Rating must be above 1'],
        max: [5, 'Rating must be below 5'],
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [{
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
    }],
    categories: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Category'
        }
    ]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

productSchema.index({ price: 1 });

// VIRTUAL POPULATE
productSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'product',
    localField: '_id'
});

// productSchema.pre('save', async function (next) {
//     const categoriesPromises = this.categories.map(async id => await Category.findById(id));
//     this.categories = await Promise.all(categoriesPromises);
//     next();
// });

productSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'categories',
        select: '-__v -createdAt'
    });
    next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
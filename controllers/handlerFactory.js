const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/apiFeatures");

exports.getOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query;

    if (!doc) {
        return next(new AppError('No document found with this ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: doc
    });
});

exports.getAll = Model => catchAsync(async (req, res, next) => {

    // TO ALLOW FOR NESTED GET REVIEWS ON PRODUCT (HACK)
    let filter = {};
    if (req.params.productId) filter = { product: req.params.productId }

    // EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .pagination();

    const doc = await features.query;

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        requestTime: req.requestTime,
        results: doc.length,
        data: doc,
    });
});

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({
        status: 'success',
        data: newDoc
    })
});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(
        req.params.id,
        req.body, {
        new: true,
        runValidators: true
    });

    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: doc,
    });
});

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        message: 'Product deleted successfully',
    });
});
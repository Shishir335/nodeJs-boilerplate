const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = id => jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
});

const createAndSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() +
            process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    // removing the password from response
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token: token,
        data: user
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);

    const url = `${req.protocol}://${req.get('host')}/me`;
    
    await new Email(newUser, url).sendWelcome();

    createAndSendToken(newUser, 201, res);
})

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) check id email and password exists
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400))
    }

    // 2) check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401))
    }

    // 3) if everything is ok, send token to client
    createAndSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check if it's there

    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('You are not logged in.', 401));
    }

    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
        return next(new AppError('The user belongs to this token does not exists.', 401));
    }

    // 4) Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('Password changed. Login again', 401));
    }

    // Grant access to protected route
    req.user = currentUser;

    next();
});

exports.restrictTo = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return next(
            new AppError('You do not have permission to perform this action.', 403));
    }

    next();
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with this email address', 404));
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });


    try {
        // 3) send it to user's email
        const resetURL =
            `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

        await new Email(user, resetURL).sendPasswordReset();

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email.'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending the email. Try again later!', 500))
    }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user of the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.
        findOne({
            passwordResetToken: hashedToken,
            passwordResetExpire: { $gt: Date.now() }
        });

    // 2) if token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or expired', 400));
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;

    await user.save();

    // 3) Update changedPasswordAt property for the user

    // 4) Log the user in, send JWT
    createAndSendToken(user, 200, res);
});

exports.changePassword = catchAsync(async (req, res, next) => {
    // 1) Get user form collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if the posted current password is correct
    if (!(user.correctPassword(req.body.currentPassword, user.password))) {
        return next(new AppError('Your current password is wrong', 401));
    }

    // 3) If so, update password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;

    await user.save();

    // 4) Log user in, send jwt
    createAndSendToken(user, 200, res);

});

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Review = require('./models/reviewModel');

process.on('uncaughtException', () => {
    process.exit(1);
});

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

// mongoose.connect(process.env.DATABASE_LOCAL, { // for local
mongoose.connect(DB)
    .then(async () => {
        await Review.syncIndexes();
    });

const app = require('./app');

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
});

process.on('unhandledRejection', () => {
    server.close(() => {
        process.exit(1);
    });
});

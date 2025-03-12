const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Review = require('./models/reviewModel');

process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    console.log('uncaughtException');
    process.exit(1);
});

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

// mongoose.connect(process.env.DATABASE_LOCAL, { // for local
mongoose.connect(DB)
    .then(async () => {
        console.log('db connection success')
        await Review.syncIndexes();
    });

const app = require('./app');

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('unhandledRejection');
    server.close(() => {
        process.exit(1);
    });
});

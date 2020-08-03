const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const bodyParser =  require('body-parser');

const app = express();

// Load env
dotenv.config({ path: './config.env'});
const port = process.env.PORT || 8000;

// Body-parser Middlwr
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Profile routes
app.use(require('./routes/profile'));

// Dev loggin
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.listen(port, () => {
    console.log(`server running in ${process.env.NODE_ENV} mode on port ${port}`);
});
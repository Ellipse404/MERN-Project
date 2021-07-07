const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express()

// db connection
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true

}).then(() => console.log('Database Connection Successfull'))
    .catch(err => console.log('Database Connection Failed due to :', err));
//
// import routers
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')


//app middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
// app.use(cors()); // allows all origin
if ((process.env.NODE_ENV = 'developement')) {
    app.use(cors({ origin: `http://localhost:3000` }));
}

// middleware
app.use('/api', authRoutes);
app.use('/api', userRoutes);

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
    console.log(`Application is   Running on localhost:${PORT}`);

});
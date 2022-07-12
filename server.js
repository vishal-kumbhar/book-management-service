const express = require('express')
const morgan = require('morgan')
const path = require('path')
const requestIp = require('request-ip')
const cors = require('cors');
const { apiError } = require("./src/services/Response");

// import i18n
const i18n = require('./src/i18n/i18n')

global.__basedir = `${__dirname}/`

// set port
const port = process.env.PORT || 3002

// create express application
const app = express()

// app configuration
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.set('view engine', 'pug')
    //app.set('views', path.join(`${__dirname}/src`, 'public'))
app.use(express.static(path.join(`${__dirname}/src`, 'public')));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
app.use(i18n)
app.use(requestIp.mw())
app.use(cors());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
    next()
})

// import routes
 const { apiUserRoutes} = require('./src/routes/index');
// app.use('/admin', adminRoutes);
 app.use('/api', apiUserRoutes);

// error handling
// app.use((err, req, res, next) => {
//     let error = apiError(err);
//     res.status(error.status || 500);
//     res.send(error);
// });


const db = require("./src/models");
// db.sequelize.sync();

app.listen(port, () => {
    console.log(`Server listening at port ${port}`)
})
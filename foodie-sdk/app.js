const express = require('express');
// const passport = require('passport');
const path = require('path');
const router = express.Router();
const bodyParser = require('body-parser');
const cors = require('cors');
var cron = require('node-cron');
const cookieParser = require("cookie-parser");
const config = require('./config/cred');
const dbConnection = require('./config/dbConnection');

//Routes
const studentRoute = require('./routes/student');
const identityRoute = require('./routes/identity');
const app = express();

const helmet = require("helmet");
app.use(helmet());

// Enable CORS
app.use(cors({credentials: true, origin: true}));
//Configure our app
app.use(express.urlencoded({extended: true}));
app.use(express.json());
// app.use(passport.initialize());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// require('./middleWare/passport');
// dbConnection.dbconnect();

// app.use(requestInfo)
// app.use(httpLogger)

// const {jwtAuth, identityToken } = require('./middleWare/auth');
const { ENVIRONMENTS, WHITE_LISTED_DOMAINS } = require('./utils/Constants');

if(config.ENV != ENVIRONMENTS.DEV){
    app.use(cors({credentials: true, origin: function (origin, callback) {
      if (WHITE_LISTED_DOMAINS.indexOf(origin) !== -1 || !origin) {
        callback(null, true)
      } else {
        callback(new Error('Not authorized'))
      }
    }}))
  }else {
  app.use(cors({credentials: true, origin: true}));
}

//app.use(passport.authenticate("jwt", { session: false }));
app.use('/sdk/', router);
// app.use('/sdk/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {customCss}));
app.use('/sdk/api/v2/student', studentRoute);
app.use('/sdk/api/v2/registerEnrollUser', identityRoute);

app.listen(config.SDK_PORT, () => {
    console.log(`Server running on ${config.HOST}:${config.SDK_PORT}/`);
    // jobs.BulkProductUploadJob();
    // blockEventListner.startListner ;
});

app.use((req, res, next) => {
    const error = new Error(`Not Found- ${req.originalUrl}`)
    res.status(404)
    next(error)

})

app.use((error, req, res, next) => {
    const statusCode = req.statusCode === '200' ? 500 : res.statusCode
    res.status(statusCode)
    res.json({
		success: false,
        message: error.message
    })
})


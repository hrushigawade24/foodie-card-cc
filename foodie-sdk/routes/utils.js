const express = require("express");
const router = express.Router();
const {jwtAuth} = require('../middleWare/auth');
const utilsController=require('../src/handlers/utilsController');

//For Printer
router.get("/printer", jwtAuth,utilsController.getPrinterInfo);
module.exports = router;

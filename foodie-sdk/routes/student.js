const express = require("express");
const router = express.Router();
const StudentController = require('../src/handlers/STUDENT-controller');
const studentController = new StudentController();

// router.post("/", mbseController.addMBSEDetails );



router.post("/mint", studentController.mintToken );//done
router.post("/transfer", studentController.transferToken );//done
router.post("/burn", studentController.burnToken );//done



module.exports = router;    

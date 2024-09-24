const express = require("express");
const router = express.Router();
const StudentController = require('../src/handlers/STUDENT-controller');
const studentController = new StudentController();

// router.post("/", mbseController.addMBSEDetails );



router.post("/mint", studentController.mintToken );//done
router.post("/transfer", studentController.transferToken );//done
router.post("/burn", studentController.burnToken );//done
router.post("/getBalance", studentController.getBalance); // done
router.post("/getQuery", studentController.getQuery );
router.post("/getAllOwner", studentController.getAllOwner );
router.post("/getHistory", studentController.getHistory );



module.exports = router;    

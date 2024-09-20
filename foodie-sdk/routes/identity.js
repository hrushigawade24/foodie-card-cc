const express = require("express");
const router = express.Router();
const {registerEnrollUser} = require('../src/handlers/userController');

router.post('/', registerEnrollUser);
router.post('/addCollege', registerEnrollUser);
router.post('/addStudent', registerEnrollUser);

module.exports = router;
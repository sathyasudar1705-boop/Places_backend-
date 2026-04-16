const express = require("express");
const { check } = require("express-validator");
const usersControllers = require("../controllers/users-controllers");


const router = express.Router();



// GET /api/users
router.get("/", usersControllers.getUsers);



// POST /api/users/signup
router.post("/signup",[
    check("name").not().isEmpty(),
    check("email").isEmail().normalizeEmail(),
    check("password").isLength({ min: 6 })
], usersControllers.signup);



// POST /api/users/login
router.post("/login", usersControllers.login);







module.exports = router;

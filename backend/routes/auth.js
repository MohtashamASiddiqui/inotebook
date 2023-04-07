const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var fetchuser = require("../middleware/fetchuser");

const JWT_SECRET = "foandfna dnf adosnf ";

// Route 1: Create a User using:post "/api/auth/createuser/", No login required
router.post(
    "/createuser", [
        body("name", "Enter a valid").isLength({ min: 3 }),
        body("email", "Enter a valid email").isEmail(),
        body("password", "Password must be atleast 5 characters").isLength({
            min: 5,
        }),
    ],
    async(req, res) => {
        // If there are errors, return bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // Check whether this email existing
        try {
            let user = await User.findOne({ email: req.body.email });
            if (user) {
                return res
                    .status(400)
                    .json({ error: "Sorry a user with this email already exist" });
            }
            // Create a new user
            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(req.body.password, salt);
            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: secPass,
            });
            const data = {
                user: {
                    id: user.id,
                },
            };

            const authtoken = jwt.sign(data, JWT_SECRET);
            console.log(authtoken);
            res.json({ authtoken });
            // catch errors
        } catch (error) {
            console.log(error.message);
            res.status(500).send("Some Error occured");
        }
    }
);

// Route 1: Authenticate a User using: Post "/api/auth/login/". No login required
router.post(
    "/login", [
        body("email", "Enter a valid email").isEmail(),
        body("password", "Password cannot be blank").exists(),
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        try {
            let user = await User.findOne({ email });
            if (!user) {
                return res
                    .status(400)
                    .json({ error: "Please try to login with correct credentails" });
            }
            const passwordCompare = await bcrypt.compare(password, user.password);
            if (!passwordCompare) {
                return res
                    .status(400)
                    .json({ error: "Please try to login with correct credentials" });
            }

            const data = {
                user: {
                    id: user.id,
                },
            };
            const authtoken = jwt.sign(data, JWT_SECRET);
            res.json({ authtoken });
        } catch (error) {
            console.log(error.message);
            res.status(500).send("Internal Server Error ");
        }
    }
);

// Route 3: Get loggedin User Details using: Post "/api/auth/getuser/". No login required
router.post("/getuser", fetchuser, async(req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error ");
    }
});
module.exports = router;
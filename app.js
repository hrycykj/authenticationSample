require ("dotEnv").config()
require ("./authenticationSample/config/database.js").connect()
const bcrypt = require ("bcryptjs")
const jwt = require ("jsonwebtoken")
const express = require("express")

const auth = require ("./authenticationSample/middleware/auth")

const app = express()

app.use (express.json())

// importing user context
const User = require ("./authenticationSample/model/user")

app.post("/welcome", auth, (req,res) => {
    res.status(200).send("Welcome!")
})

// Register
app.post ("/register", async (req, res) => {
    try {
        // our register logic starts here
        const { first_name, last_name, email, password } = await req.body

        // validate user input
        if (!(email && password && first_name && last_name)) {
            res.status(400).send("All inputs are required!")
        }

        // check if user already exists
        // Validate if user exists in our database
        const oldUser = await User.findOne({ email })

        if (oldUser) {
            return res.status(409).send("User Already Exists! Please login")
        }

        // Encrypt user password
        encryptedPassword = await bcrypt.hash(password, 10)

        // Create user in our database
        const user = await User.create ({
            first_name,
            last_name,
            email: email.toLowerCase(),
            password: encryptedPassword,
        })

        // Create token
        const token = jwt.sign (
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
        )

        // save user token
        user.token = token

        // return new user
        res.status(201).json(user)
    } catch (err) {
        console.log (err)
    }
    // our register logic ends here
})

// Login
app.post ("/login", async (req, res) => {
    // our login logic starts here
    try {
        // Get user input
        const {email, password} = req.body

        // Validate user input
        if (!(email && password)) {
            res.status(400).send("All inputs are required!")
        }

        // Validate if user exists in our database
        const user = await User.findOne ({email})

        if (user && (await bcrypt.compare (password, user.password))) {
            // Create token
            const token = jwt.sign (
                {user_id: user._id, email},
                process.env.TOKEN_KEY,
                {expiresIn: "2h"}
            )
            
            // save user token
            user.token = token
            
            // user
            res.status(200).json(user)
        }
        res.status(400).send("Invalid Credentials!")
    } catch (err) {
        console.log(err)
    }
    // our register logic ends here
})

// root
app.get ("/", (req, res) => {
    return res.send("root directory in Authentication Sample code is here")
})

module.exports = app
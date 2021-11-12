const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { response, request } = require('express');
const User = require("./mongo");

// creat server
const app = express();

//using middlewares
app.use(bodyParser.json());
app.use(cors);

//connecting mongo 

const dbURL = "mongoose://127.0.0.1:27017/MvcDb";
mongoose.connect(dbURL,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
    }
        .then(() => {
            console.log("connected with db")

            //start server
            app.listen(8081, () => {
                console.log("server has started on port 8081");
            })

            //signup api

            app.post("/api/user/signUp", (request, response) => {
                const { name, email, password } = request.body
                console.log(request.body);

                //ckecking if user exist
                let existingUser;
                try {
                    existingUser = await User.findOne({ email: email })
                } catch (error) {
                    return response.status(500).json("error in checking existing user")
                }
                console.log(existingUser);
                //if user exist then
                if (existingUser) {
                    return response.status(422).json("user already exist");
                }

                //if user does nott exist then convert the password into hashed password
                let hashedPassword
                try {
                    hashedPassword = await bcrypt.hash(password, 12)
                } catch (error) {
                    return response.status(500).json("error in converting to hash password")
                }

                var createdUser = new User({
                    name,
                    email,
                    password: hashedPassword
                })

                try {
                    await createdUser.save();
                }
                catch (err) {
                    return response.status(500).json("Error in saving user")
                }

                //token generation

                let token
                try {
                    token = jwt.sign(
                        { userId: createdUser.id, email: createdUser.email },
                        "myToken1234",
                        { expiresIn: "21d" }
                    )
                } catch (error) {
                    return response.status(500).json("error in generating token");
                }
                response.status(201).json({
                    userId:createdUser.id,
                    email:createdUser.email,
                    name:createdUser.name,
                    token:token
                })

            })
        })
        .catch(err => {
            console.log(err)
        })
)





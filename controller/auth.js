const client = require("../sanity/sanity")
const bcrypt = require("bcrypt")

//register a New User
const register = async(req, res) => {
    const username = req.body.username //username
    const email = req.body.email //email
    const firstName = req.body.firstname //user's firstname
    const lastName = req.body.lastname //user's lastname
    let password = req.body.password //user's password
    let file = req.file.key //user's profile picture
    //save profile picture using sanity media optimizer
    let profilePicture = `https://kelbis.mo.cloudinary.net/${file}?tx=w_200,h_200,g_auto,c_fill` 
    password = await bcrypt.hash(password, 10) //hash password
    //create user sanity document doc
    let doc = {
        _type: "user",
        username,
        firstName,
        lastName,
        password,
        email,
        profilePicture
    }
    let user = await client.create(doc) //create user document
    res.status(201).send(user)
}

const login = async(req, res) => {
    const usernameEmail = req.body.usernameEmail //username
    //Perform a query to check if a user exists with that username or email
    let query = `*[_type == "user" && username == "${usernameEmail}" || email == "${usernameEmail}"]`
    let users = await client.fetch(query)
    //if no user throw error
    if (users.length == 0) throw new Error("Username or Email is incorrect")
    let password = req.body.password //user's password
    //check if the user's password is correct 
    const match = await bcrypt.compare(password, users[0].password)
    // console.log(match, users[0].password)
    if(!match) throw new Error("Incorrect Password")
    res.cookie("user", true, {maxAge: 1000 * 60 * 60 * 24 * 30}) //Set user in cookies
    res.cookie("userId", users[0]._id, {maxAge: 1000 * 60 * 60 * 24 * 30}) //Set username in cookies
    res.cookie("username", users[0].username, {maxAge: 1000 * 60 * 60 * 24 * 30}) //Set username in cookies
    res.send(users)
}

module.exports = {
    register,
    login
}

    // const match = await bcrypt.compare("Betheextra7", "$2b$10$pHx0LuXrVgH0CZoGMqSM5ujKhXDuRPIzpRV3iRjqPZkpyKSxbtkH2")
    // if(!match) {
    //     throw new Error("Password incorrect")
    // }
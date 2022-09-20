//check if an account exist with the same username or email as that of a new user
const client = require("../sanity/sanity")

const register = async(req, res, next) => {
    const username = req.body.username //username
    const email = req.body.email //email

    //Check if any user has same Username
    let query = `*[_type == "user" && username == "${username}"]`
    let users = await client.fetch(query)
    if (users.length > 0) throw new Error("An account exists with this username, Please enter a different username")
    
    //check if any user has same email
    query = `*[_type == "user" && email == "${email}"]`
    users = await client.fetch(query) //perform query
    if (users.length > 0) throw new Error("An Acoount exists with this email, Please enter a different email")
    //If not user with same Username or email
    res.status(200).send("Good")
}

module.exports = register
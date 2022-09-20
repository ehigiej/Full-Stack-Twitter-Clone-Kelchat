const client = require("../sanity/sanity")


//Homepage
const home = async(req, res) => {
    const cookies = req.cookies
    if(cookies.user == "false" || cookies.user == undefined) return res.redirect("/login")
    res.render("home")
}

//login Page 
const login = (req, res) => {
    res.render("login")
}

module.exports = {
    home, 
    login
}
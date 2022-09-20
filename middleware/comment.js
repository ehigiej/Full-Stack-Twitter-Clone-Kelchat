const client = require("../sanity/sanity")
//comment middleware to prevent duplicate of tweet or comment reply 

const duplicate = (req, res, next) => {
    console.log(req.body)
    next()
}

module.exports = duplicate
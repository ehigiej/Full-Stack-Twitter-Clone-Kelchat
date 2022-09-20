//fetch post
const client = require("../sanity/sanity")

const post = (req, res) => {
    //The Post Page for Post or comment Info
    res.render("post")
}

const postInfo = async(req, res) => {
    let postId = req.body.postId 
    const cookies = req.cookies //Get The Cookies 
    const userId = cookies.userId //Get the UserId from cookies 
    let query = `*[_type == "post" && _id == "${postId}"]{_id, _createdAt, caption, media, postedBy->{_id, profilePicture, username}, "likes": count(likes), postComment[]->{caption, media, postedBy->{_id, username, profilePicture}}}`
    let post = await client.fetch(query)
    res.status(200).send(post)
}

module.exports = {
    post,
    postInfo
}
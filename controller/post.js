//fetch post
const client = require("../sanity/sanity")

const post = (req, res) => {
    //The Post Page for Post or comment Info
    res.render("post")
}

/* GET THE INFO OF A POST FROM POST ID */
const postInfo = async(req, res) => {
    let postId = req.body.postId 
    const cookies = req.cookies //Get The Cookies 
    const userId = cookies.userId //Get the UserId from cookies 
    let query = `*[_type == "post" && _id == "${postId}"]{_id, _createdAt, caption, media, postedBy->{_id, profilePicture, username}, "likesCount": count(likes), postComment[]->{_id, caption, media, commentLike[]{_ref}, postedBy->{_id, username, profilePicture}}, likes[]{_ref}}`
    let post = await client.fetch(query)
    /* CHECK IF USER LIKED THIS PARTICULAR POST TO SET LIKE BTN TO RED 
    FIRST CHECK IF POST HAS AN ARRAY OF LIKES, THEN LOOP THROUGH LIKES*/
    if(post[0].likes != undefined) {
        post[0].likes.forEach(like => {
            if(like._ref == userId) post[0]["likedByUser"] = true;
        })
    }
    /* LOOP THROUGH ALL COMMENTS UNDER POST AND CHECK IF USER LIKED COMMENT 
    IF USER LIKED COMMENT, SET LIKE BTN TO RED
    FIRST CHECK IF COMMENT HAS AN ARRAY OF LIKES, THEN LOOP THROUGH LIKES*/
    post[0].postComment.forEach(comment => {
        if(comment.commentLike != undefined) {
            comment.commentLike.forEach(postComment => {
                if(postComment._ref == userId) comment["likedByUser"] = true 
            })
        }
    })
    res.status(200).send(post)
}

module.exports = {
    post,
    postInfo
}
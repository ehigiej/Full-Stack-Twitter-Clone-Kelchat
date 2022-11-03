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
    let query = `*[_type == "post" && _id == "${postId}"]{
                    _id, 
                    _createdAt, 
                    caption,
                    media, 
                    postedBy->{_id, profilePicture, username}, 
                    "likesCount": count(likes), 
                    "likedByUser": "${userId}" in likes[]._ref,
                    postComment[]->{_id, caption, media, "commentLike": count(commentLike), 
                                    postedBy->{_id, username, profilePicture},
                                    "replies" : count(replies),
                                    "likedByUser": "${userId}" in commentLike[]._ref}, 
                    }`
    let post = await client.fetch(query)
    //Throw Error when there's no Post 
    if(post.length == 0) throw new Error("No Post in Database");
    /* CHECK IF USER LIKED THIS PARTICULAR POST TO SET LIKE BTN TO RED 
    FIRST CHECK IF POST HAS AN ARRAY OF LIKES, THEN LOOP THROUGH LIKES*/
    // if(post[0].likes != undefined || post[0].likes != null) {
    //     post[0].likes.forEach(like => {
    //         if(like._ref == userId) post[0]["likedByUser"] = true;
    //     })
    // } else {
    //     //Post doesn't have likes array, set it to an Empty Array
    //     post[0].likes = [];
    // }
    // /* LOOP THROUGH ALL COMMENTS UNDER POST AND CHECK IF USER LIKED COMMENT 
    // IF USER LIKED COMMENT, SET LIKE BTN TO RED
    // FIRST CHECK IF COMMENT HAS AN ARRAY OF LIKES, THEN LOOP THROUGH LIKES*/
    // if(post[0].postComment != null || post[0].postComment != undefined) {
    //     post[0].postComment.forEach(comment => {
    //         if(comment.commentLike != undefined) {
    //             comment.commentLike.forEach(postComment => {
    //                 if(postComment._ref == userId) comment["likedByUser"] = true 
    //             })
    //         }
    //     })
    // } else {
    //     post[0].postComment = [];
    // }
    res.status(200).send(post)
}

module.exports = {
    post,
    postInfo
}
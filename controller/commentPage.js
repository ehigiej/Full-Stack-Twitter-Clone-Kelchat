//Handle Comment Route and Infomation about a comment from commentId
const client = require("../sanity/sanity")

const commentPage = (req, res) => {
    //Render Comment Ejs for comment URL 
    res.render("comment");
}


//Get Info About Comment 
const commentInfo = async(req, res) => {
    let commentId = req.body.commentPageId //Get The CommentId 
    const cookies = req.cookies //Get The Cookies 
    const userId = cookies.userId //Get the UserId from cookies 
    let query = `*[_type == "comment" && _id == "${commentId}"]{
        _id, 
        _createdAt, 
        caption,
        media, 
        postedBy->{_id, profilePicture, username}, 
        post->{_id, 
                caption, 
                postedBy->{_id, profilePicture, username},
                "likesCount": count(likes),
                "likedByUser": "${userId}" in likes[]._ref,
                "postComment": count(postComment),
                media
                },
        replies[]->{_id, 
                    caption, 
                    media, 
                    "commentLike": count(commentLike), 
                    postedBy->{_id, username, profilePicture},
                    "replies" : count(replies),
                    "likedByUser": "${userId}" in commentLike[]._ref
                    },
        "likesCount": count(commentLike), 
        "likedByUser": "${userId}" in commentLike[]._ref,
        refComment[]->{
                        _id, 
                        caption, 
                        media, 
                        "commentLike": count(commentLike), 
                        post->{_id, 
                            caption,
                            media, 
                            postedBy->{_id, profilePicture, username},
                            "likesCount": count(likes),
                            "likedByUser": "${userId}" in likes[]._ref,
                            "postComment": count(postComment)
                            },
                        postedBy->{_id, username, profilePicture},
                        "replies" : count(replies),
                        "likedByUser": "${userId}" in commentLike[]._ref}, 
        }`
    let commentDoc = await client.fetch(query)
    //Throw Error when there's no Post 
    if(commentDoc.length == 0) throw new Error("No Post in Database");
    res.status(200).send(commentDoc);
}


module.exports = {
    commentPage,
    commentInfo
}
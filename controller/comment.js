const client = require("../sanity/sanity")

/* HANDLE WHEN USERS UPLOAD COMMENS */
const comment = async(req, res) => {
    const cookies = req.cookies //get the cookies 
    const userId = cookies.userId //get the user's Id for reference from the cookies
    const caption = req.body.caption //comment caption 
    const commentTime = new Date().toISOString() //get the time comment was posted 
    const postId = req.body.postId //get the reference post Id
    const media = [] //post media if any
    /* IF COMMENT HAS MEDIA APPEND REQ.FILES.KEY TO MEDIA  */
    if(req.files) {
        //if comment has media 
        req.files.forEach(file => {
            media.push(`https://kelbis.mo.cloudinary.net/${file.key}`) //push file key to media araay
        })
    }
    //Comment Query Doc
    let doc = {
        _type: "comment",
        caption,
        postedBy : {
            _ref: userId
        },
        dateTime : commentTime,
        post : {
            _ref: postId
        },
        media
    }
    let commentDoc = await client.create(doc) //Create Comment In Comment SCHEMA 
    /* NOW APPEND COMMENT TO POST 
    EACH POST DOCUMENT HAS AN ARRAY TO HOLD REFERENCES TO ALL COMMENTS */
    await client
        .patch(postId)
        .setIfMissing({postComment: []})
        .append('postComment', [{_ref: commentDoc._id}])
        .commit({autoGenerateArrayKeys: true})
    // console.log(req.body)
    res.status(200).send(commentDoc)
}


/* CHECK IF COMMENT IS A DUPLICATE 
Comment Duplicate has a slight Bug 
for eg, if a user uploads a comment and upload same comment within the interval of 30s
both comments will be uploaded, because first comment hasn't been updated in sanity Groq but cached*/
const commentDuplicate = async(req, res) => {
    const cookies = req.cookies //get the cookies 
    const userId = cookies.userId //get the user's Id for reference
    const caption = req.body.caption //comment caption 
    const postId = req.body.postId //get the reference post Id
    let query = `*[_type == "comment" && caption == "${caption}" && (references("${userId}") && references("${postId}"))]` //query to find duplicate
    let commentDoc = await client.fetch(query)
    if(commentDoc.length > 0) {
        //meaning there's a duplicate
        throw new Error("Comment duplicate")
    }
    res.send(commentDoc)
}

module.exports = {
    comment,
    commentDuplicate
}
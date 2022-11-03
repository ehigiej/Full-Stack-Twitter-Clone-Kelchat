const client = require("../sanity/sanity")

/* HANDLE WHEN USERS UPLOAD COMMENTS TO A POST */
const comment = async(req, res) => {
    const cookies = req.cookies //get the cookies 
    const userId = cookies.userId //get the user's Id for reference from the cookies
    if(!userId) throw new Error("No Id Found")
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
    res.status(200).send(commentDoc._id)
}

/* CHECK IF COMMENT IS A DUPLICATE 
Comment Duplicate has a slight Bug 
for eg, if a user uploads a comment and upload same comment within the interval of 30s
both comments will be uploaded, because first comment hasn't been updated in sanity Groq but cached*/
const commentDuplicate = async(req, res) => {
    const cookies = req.cookies //get the cookies 
    const userId = cookies.userId //get the user's Id for reference
    if(!userId) throw new Error("No Id Found")
    const caption = req.body.caption //comment caption 
    const postId = req.body.postId //get the reference post Id
    let query = `*[_type == "comment" && caption == "${caption}" && (references("${userId}") && references("${postId}"))]` //query to find duplicate
    let commentDoc = await client.fetch(query) //CHECK FOR DUPLICATE
    if(commentDoc.length > 0) {
        //meaning there's a duplicate
        throw new Error("Comment duplicate")
    }
    res.send(commentDoc) //ELSE NO DUPLICATE
}

/* DELETE COMMENT */
/* DELETE COMMENT */
const commentDelete = async(req, res) => {
    const commentId = req.body.commentId //Comment Id 
    const postId = req.body.postId //Post Id 
    /* FIRST REMOVE COMMENT FROM POST COMMENT ARRAY, THEN DELETE COMMENT DOCUMENT */
    let removeComment = [`postComment[_ref == "${commentId}"]`]
    await client.patch(postId).unset(removeComment).commit() //REMOVE COMMENT FROM POST COMMENT ARRAY 
    await client.delete(commentId);
    res.status(200).send("deleted")
}

/* HANDLE COMMENTING UNDER A COMMENT NOT POST 
Commenting under a comment works quite similar to that of a post only differences is instead of 
appending to the array of a post you append to the array of the comment and also a comment under a comment references the comment */
const commentComment = async(req, res) => {
    const cookies = req.cookies //get the cookies 
    const userId = cookies.userId //get the user's Id for reference from the cookies
    const caption = req.body.caption //comment caption 
    const commentTime = new Date().toISOString() //get the time comment was posted 
    const postId = req.body.postId //get the reference post Id
    const commentId = req.body.commentId //get the reference comment Id
    const media = [] //post media if any
    if(!userId) throw new Error("No Id Found")
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
        media,
        // post : {
        //     _ref: postId
        // }
    }
    let commentDoc = await client.create(doc) //Create Comment In Comment SCHEMA 
    /* find all previous comment references commentId has */
    let refQuery = `*[_type == "comment" && _id == "${commentId}"].refComment[]._ref`
    let preRef = await client.fetch(refQuery) //Query the database 
    /* loop through preRef and append the ref to refComment of the commentDoc(the new created comment document) 
    that's like getting the previous references of the comment it's about to be commented on */
    for (let i = 0; i < preRef.length; i++) {
        await client
            .patch(commentDoc._id)
            .setIfMissing({refComment: []})
            .append('refComment', [{_ref: preRef[i]}])
            .commit({autoGenerateArrayKeys: true})
    }
    /* NOW APPEND THE ID OF CURRENT COMMENT COMMENTED ON TO THE REF COMMENT OF NEW COMMENT (commentDoc) */
    await client
        .patch(commentDoc._id)
        .setIfMissing({refComment: []})
        .append('refComment', [{_ref: commentId}])
        .commit({autoGenerateArrayKeys: true})
    /* NOW APPEND COMMENT TO COMMENT  
    EACH COMMENT DOCUMENT HAS AN ARRAY TO HOLD REFERENCES TO ALL COMMENTS COMMENTED UNDER IT */
    await client
        .patch(commentId)
        .setIfMissing({replies: []})
        .append('replies', [{_ref: commentDoc._id}])
        .commit({autoGenerateArrayKeys: true})
    // console.log(req.body)
    res.status(200).send(commentDoc._id)
}

/* CHECK IF COMMENT UNDER A COMMENT IS A DUPLICATE 
Check if a user has commented same time before under a comment not post 
there's a slight difference between the two*/
const cCommentDuplicate = async(req, res) => {
    const cookies = req.cookies //get the cookies 
    const userId = cookies.userId //get the user's Id for reference
    if(!userId) throw new Error("No Id Found")
    const caption = req.body.caption //comment caption 
    const postId = req.body.postId //get the reference post Id,
    const commentId = req.body.commentId //Get The reference comment Id
    let query = `*[_type == "comment" && caption == "${caption}" && (references("${userId}") && references("${commentId}"))]` //query to find duplicate
    let commentDoc = await client.fetch(query) //CHECK FOR DUPLICATE
    if(commentDoc.length > 0) {
        //meaning there's a duplicate
        throw new Error("Comment duplicate")
    }
    res.send(commentDoc) //ELSE NO DUPLICATE
}

//Testing Delete of a comment 
const testDelete = async(req, res) => {
    const commentId = req.body.commentId //get the commentId to be deleted 
    let query = `*[references("${commentId}")] | order(_createdAt asc) {_id, postComment, refComment}` //query through
    let commentArray = await client.fetch(query); //Get All docs referencing this comment 
    //then remove from the first 
    if(commentArray.length > 0) {
        if(commentArray[0].postComment === null) {
            //meaning it's a comment
            let removeDoc = [`replies[_ref == "${commentId}"]`]
            await client.patch(commentArray[0]._id).unset(removeDoc).commit() //REMOVE COMMENT FROM POST COMMENT ARRAY  
        } else {
            //meaning it's a post 
            let removeDoc = [`postComment[_ref == "${commentId}"]`]
            await client.patch(commentArray[0]._id).unset(removeDoc).commit() //REMOVE COMMENT FROM POST COMMENT ARRAY 
        }
        for(let i = 1; i < commentArray.length; i++) {
            let removeDoc = [`refComment[_ref == "${commentId}"]`]
            await client.patch(commentArray[i]._id).unset(removeDoc).commit();
        }
    }
    await client.delete(commentId);
    res.send("Successful");
}

module.exports = {
    comment,
    commentDuplicate,
    commentDelete,
    commentComment,
    cCommentDuplicate,
    testDelete
}
//Fetch the User's Followers and Following list 
const client = require("../sanity/sanity") //SANITY CLOUD
const redisClient = require("../redis/redis") //REDIS CLIENT CLOUD

//Get Informations about current User 
const userInfo = async(req, res) => {
    const cookies = req.cookies //Get The cookies 
    const userId = cookies.userId //get the userId from the cookies
    //perform a query and find the users Following List 
    let query = `*[_type == "user" && _id == "${userId}"] {_id, profilePicture, username, following[]{_ref}}`
    let user = await client.fetch(query) //get the user Info from sanity
    if(user.length == 0)  throw new Error("No User Found")
    res.send(user);
}

//get the latest post from the user's currentUser is following
const post = async(req, res) => {
    /* Querying for all post might take a time, so a start and stop is used to determine the amount of post to query for. 
    as the user scrolls down, start and stop increases */
    const start = req.body.start //Get The Start 
    const stop = req.body.stop //Get The Stop 
    const cookies = req.cookies //get the cookies 
    const userId = cookies.userId //get the user's Id 
    let cachePost = await redisClient.get(`post.${userId}.${stop}`) 
    if(cachePost != null ) return res.json(JSON.parse(cachePost))
    else {
        /* GET THE LATEST POST FROM THE USER"S FOLLOWING LIST USING PostQuery */
        let postQuery = `*[_type == "post" && (postedBy._ref in *[_type == "user" && _id == "${userId}"].following[]._ref || postedBy._ref in ["${userId}"])]
                                        [${start}..${stop}] | order(_createdAt desc) 
                                        {_id,
                                        caption,
                                        postedBy->{
                                            username,
                                            profilePicture,
                                            _id
                                        },
                                        media,
                                        "postComment" : count(postComment),
                                        "likes" : count(likes),
                                        "likedByUser" : "${userId}" in likes[]._ref}`
        const latestPost = await client.fetch(postQuery)
        //cache the post, making reference of the userId and the stop value
        redisClient.setEx(`post.${userId}.${stop}`, 7200, JSON.stringify(latestPost))
        res.status(200).send(latestPost)
    }
}

//Post Likes
/* HANDLE LIKE EVENT ON POST*/
const like = async(req, res) => {
    //handle post like 
    const cookies = req.cookies //Get The Cookies 
    const userId = cookies.userId //Get the UserId from cookies 
    //A checker signifies either to like a post (false) or unlike a post(true)
    //When Checker is false it means like a Post and when checker is True it means unlike a post 
    const checker = req.body.checker 
    const postId = req.body.postId //get the post Id
    if(checker == false) {
        //meaning like a post
        await client.patch(postId)
                    .setIfMissing({likes: []})
                    .append("likes", [{_ref : userId}])
                    .commit({autoGenerateArrayKeys: true})
    } else if (checker == true) {
        const userLikeToRemove = [`likes[_ref=="${userId}"]`]
        await client.patch(postId).unset(userLikeToRemove).commit()
    }
    res.status(200).send("success")
}


//COMMENT LIKES 
/* HANDLE WHEN A USER LIKES OR UNLIKE A COMMENT */
const commentLike = async(req, res) => {
    const cookies = req.cookies //Get The Cookies 
    const userId = cookies.userId //Get The UserId from Cookies 
    //A checker signifies either to like a comment (false) or unlike a comment(true)
    //When Checker is false it means like a comment and when checker is True it means unlike a comment 
    const checker = req.body.checker 
    const commentId = req.body.commentId //get the commentId Id
    if(checker == false) {
        //meaning like a comment
        await client.patch(commentId)
                    .setIfMissing({commentLike: []})
                    .append("commentLike", [{_ref : userId}])
                    .commit({autoGenerateArrayKeys: true})
    } else if (checker == true) {
        const userLikeToRemove = [`commentLike[_ref=="${userId}"]`]
        await client.patch(commentId).unset(userLikeToRemove).commit()
    }
    res.status(200).send("success")
}


const postTest = async(req, res) => {
    /* Querying for all post might take a time, so a start and stop is used to determine the amount of post to query for. 
    as the user scrolls down, start and stop increases */
    const start = req.body.start //Get The Start 
    const stop = req.body.stop //Get The Stop 
    const cookies = req.cookies //get the cookies 
    const userId = cookies.userId //get the user's Id 
    // let cachePost = await redisClient.get(`post`) 
    // if(cachePost != null ) return res.json(JSON.parse(cachePost))
    if(1 == 100) {

    } else {
        /* GET THE LATEST POST FROM THE USER"S FOLLOWING LIST USING PostQuery */
        let postQuery = `*[_type == "post" && (postedBy._ref in *[_type == "user" && _id == "${userId}"].following[]._ref || postedBy._ref in ["${userId}"])]
                                        [${start}..${stop}] | order(_createdAt desc) 
                                        {_id,
                                        caption,
                                        postedBy->{
                                            username,
                                            profilePicture,
                                            _id
                                        },
                                        media,
                                        "postComment" : count(postComment),
                                        "likes" : count(likes),
                                        "likedByUser" : "${userId}" in likes[]._ref}`
        // let postQuery1 = `*[_type == "post" && (postedBy._ref in *[_type == "user" && _id == "${userId}"].following[]._ref || postedBy._ref in ["${userId}"])] {_id}`
        const latestPost = await client.fetch(postQuery)
        // //cache the post, making reference of the userId and the stop value
        // redisClient.setEx(`post`, 7200, JSON.stringify(latestPost))
        return res.send(latestPost)
    }
}

module.exports = {
    userInfo,
    post,
    like,
    commentLike,
    postTest
}
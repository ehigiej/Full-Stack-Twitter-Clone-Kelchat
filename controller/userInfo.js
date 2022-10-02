//Fetch the User's Followers and Following list 
const client = require("../sanity/sanity") //SANITY CLOUD
const redisClient = require("../redis/redis") //REDIS CLIENT CLOUD

const userInfo = async(req, res) => {
    const cookies = req.cookies //Get The cookies 
    const username = cookies.username //get the username from the cookies
    //perform a query and find the users Followers and Following List 
    let query = `*[_type == "user" && username == "${username}"] {_id, email, firstName, lastName, profilePicture, username, followers[]->{_id, username, profilePicture}, following[]->{_id, username, profilePicture}}`
    let user = await client.fetch(query) //get the user Info from sanity
    // //Loop through the user's followers and push each user to an  string array
    // let followers;
    // if(user[0].followers) {
    //     //check if the user has followers and append each follower to a string array
    //     followers = "["
    //     let followersLength = user[0].followers.length - 1 //get the number of followers
    //     user[0].followers.forEach((user, index) => {
    //         if(index == followersLength) {
    //             followers += '"'
    //             followers += user._ref
    //             followers += '"'
    //         } else {
    //             followers += '"'
    //             followers += user._ref
    //             followers += '",'
    //         }
    //     })
    //     followers += "]" //close the followers string array 
    // }

    // let following;
    // if(user[0].following) {
    //     //check if the user is following anyone and append each person to a string array
    //     //do same for following 
    //     following = "["
    //     let followingLength = user[0].following.length - 1//get the number of following 
    //     user[0].following.forEach((user, index) => {
    //         //push user._ref (id)
    //         if(index == followingLength) {
    //             following += '"'
    //             following += user._ref 
    //             following += '"'
    //         } else {
    //             following += '"'
    //             following += user._ref 
    //             following += '",'
    //         }
    //     })
    //     following += "]" //close the following string array 
    // }

    // //query through the user's followers
    // let userFollowers;
    // if(user[0].followers) {
    //     let followersQuery = `*[_type == "user" && _id in ${followers}]{_id, username, profilePicture}`
    //     userFollowers = await client.fetch(followersQuery)
    // } else {
    //     userFollowers = [] //return empty array is user has no followers
    // }

    // //query through the user's following 
    // let userFollowing;
    // if(user[0].following) {
    //     let followingQuery = `*[_type == "user" && _id in ${following}]{_id, username, profilePicture}`
    //     userFollowing = await client.fetch(followingQuery)
    // } else {
    //     userFollowing = [] //return empty array if user is following noone
    // }
    // res.status(200).json({
    //     username: user[0].username,
    //     profilePicture: user[0].profilePicture,
    //     userId: user[0]._id,
    //     followers: userFollowers,
    //     following: userFollowing
    // })
    res.send(user);
}

//get the latest post from the user's followers
const post = async(req, res) => {
    const start = req.body.start 
    const stop = req.body.stop 
    const cookies = req.cookies //get the cookies 
    const userId = cookies.userId //get the user's Id 
    let cachePost = await redisClient.get("post")
    if(cachePost != null ) return res.json(JSON.parse(cachePost))
    else {
        //get the user's following list 
        let followingQuery = `*[_type == "user" && _id == "${userId}"] {following[]{_ref}}`
        const followingList = await client.fetch(followingQuery)
        //Deconstruct followingList to an array of string 
        let followingStringArray = ""
        let followingListLength = followingList[0].following.length //get the number's of users current user is following
        followingList[0].following.forEach((user, index) => {
            followingStringArray += '"'
            followingStringArray += user._ref
            followingStringArray += '"'
            if(index != followingListLength - 1)  followingStringArray += ","
        })
        followingStringArray += `,"${userId}"`
        //Query through the database and get the latest post from the database 
        let latestPostQuery = `*[_type == "post" && references([${followingStringArray}])][${start}..${stop}] | order(_createdAt desc)`
        let latestPost = await client.fetch(latestPostQuery)
        //Get The User Info for Each Post as Post comes with a reference for a User Id
        for (let i = 0; i < latestPost.length; i++) {
            //check if the current user liked the post and set likedByUser to True
            if(latestPost[i].likes != undefined && latestPost[i].likes.length != 0) {
                latestPost[i].likes.forEach(likes => {
                    if(likes._ref === userId) latestPost[i]["likedByUser"] = true
                })
            }
            let userQuery = `*[_type == "user" && _id == "${latestPost[i].postedBy._ref}"]{profilePicture, username, _id}` //get the user Informations
            let userInfo = await client.fetch(userQuery)
            latestPost[i]["userInfo"] = userInfo[0]
        }
        redisClient.setEx(`post`, 7200, JSON.stringify(latestPost))
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

module.exports = {
    userInfo,
    post,
    like,
    commentLike
}
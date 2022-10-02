const router = require("express").Router()

const {userInfo, post, like, commentLike} = require("../controller/userInfo")

router.route("/info").get(userInfo)
router.route("/post").post(post) //handle Post 
router.route("/like").post(like) //Handle post Like 
router.route("/comment").post(commentLike)

module.exports = router
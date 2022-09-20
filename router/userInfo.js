const router = require("express").Router()

const {userInfo, post, like} = require("../controller/userInfo")

router.route("/info").get(userInfo)
router.route("/post").post(post)
router.route("/like").post(like)

module.exports = router
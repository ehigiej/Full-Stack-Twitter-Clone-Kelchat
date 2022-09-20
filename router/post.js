//Get Post Info Via post route 
const express = require("express")
const router = express.Router()

const {postInfo, post} = require("../controller/post")

router.route("/postInfo").post(postInfo) //get Information about a post
router.route("/:username/:postId").get(post)

module.exports = router
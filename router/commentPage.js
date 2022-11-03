//handle comment page 

const express = require("express");
const router = express.Router();

const {commentPage, commentInfo} = require("../controller/commentPage")

router.route("/:username/:commentId").get(commentPage);
router.route("/commentInfo").post(commentInfo)

module.exports = router;
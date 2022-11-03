import { currentMedia, countPostArea } from "./reply.js";
import { zoomEffect } from "./zoomNew.js";
const socket = io();
socket.on("Message", msg => {
  console.log(msg)
});

let pageTitle = document.querySelector("head title"); //THE PAGE TITLE TAG

let userProfileImage = document.querySelector(".user-bar .user-image"); //Profile Picture Tag for Profile Picture that shows at the top of the screen 
let commentProfileImage = document.querySelector(".comment-reply .post-section .post-sub-section img") //User's Profile Picture Tag that shows in comment Section 
/*A FUNCTION TO GET USER'S INFORMATION 
PROFILE PICTURE, FOLLOWING AND FOLLOWERS*/
async function getInfo() {
  try {
    let {data} = await axios.get("/myInfo/info")
    console.log(data)
    userProfileImage.innerHTML = `
    <img src="${data[0].profilePicture}" alt="">` //Set User' Profile Picture
    commentProfileImage.src = data[0].profilePicture //Set Current User's Profile Image for Comment Reply Section
    const userFollowing = [] //An Array For Current User Following Lists 
    //Append All the usernames of User's Current user is following to userFollowing List
    if(data[0].following != null) {
      /* If user is following other users */
      data[0].following.forEach(user => {
        userFollowing.push(user._ref) //Push Username
      })
    } 
    socket.emit("Login", {
      userId: data[0]._id,
      followers: userFollowing
    })
  } catch (error) {
    console.log(error.response.data)
  }
}

getInfo() //get user's info

let loader = document.querySelector(".loading-loader") //the loading effect div when fetching post
let homeFeed = document.querySelector(".home-feed") //The Home Feed Container for all Posts

let allLikeIcon; //Get all the like button
async function getPost() {
  //A Function to get the latest post
  let data;
  try {
    let post = await axios.post("/myInfo/post", {
      start: 0,
      stop: 10
    })
    data = post.data
    console.log(data)
  } catch (error) {
    console.log(error.response.data)
    throw "ERROR"; //If there's an error, stop function
  }
  //Create each post
  loader.classList.add("loaded") //Add loaded to loader div to cancel loading effect style 
  //Loop through the data recovered and create each post
  data.forEach(post => {
    let postDiv = document.createElement("div") //create a postDiv as ParentDiv for post details
    postDiv.classList.add("post")
    postDiv.setAttribute("id", `id${post._id}`) //set id to post ID in the database
    /* EACH POST SITS INSIDE A POST DIV WHICH CONSISTS OF TWO DIVS 
    THE POST SUB DIV AND THE POST ACTION DIV */
    /*FIRST CREATE THE POST SUB DIV 
    A DIV TO HOLD PROFILE PICTURE, USERNAME, CAPTION AND MEDIA FILES IF ANY */
    let postSubDiv = document.createElement("div") //POST SUB DIV 
    /* For POST SUB DIV, FIRST APPEND THE POST PROFILE PICTURE */
    postSubDiv.innerHTML = `
      <div class="a-links">
        <a href="/user/${post.postedBy.username}" class="user-a">
          <img src="${post.postedBy.profilePicture}" alt="${post.postedBy.username}_profilePicture" class="profile-picture">
        </a>
        <a href="/user/${post.postedBy.username}/${post._id}" class="post-a"></a>
      </div>`
    /* CREATE ANOTHER DIV TO HOLD USERNAME, CAPTION AND MEDIA FILES IF ANY */
    let usCapMediaDiv = document.createElement("div") //US for Username, Cap for Caption
    /* Handle post caption, if there's a caption, set caption to post caption */
    let postCaption = post.caption ? post.caption : "" 
    usCapMediaDiv.innerHTML =  `
      <div class="user-tt-links">
        <a href="/user/${post.postedBy.username}">
          <span class="username">${post.postedBy.username}</span>
        </a>
        <a href="/user/${post.postedBy.username}/${post._id}" class="tt-link"></a>
      </div>
      <a href="/user/${post.postedBy.username}/${post._id}">
        <div class="post-text">
          <p class="text-text">${postCaption}</p>
        </div>
      </a>`
    /* CHECK IF POST HAS MEDIA FILES, IF IT DOES CREATE A DIV FOR IT */
    let mediaLength;
    if(post.media) mediaLength = post.media.length //Get The Media Length of Post
    if(mediaLength != 0) {
      //If Post has Media
      let mediaDiv = document.createElement("div"); //create Media Div
      /* Depending on the Length of Post Media File, Style it*/
      if(mediaLength == 1) {
        mediaDiv.innerHTML = `
          <img src="${post.media[0]}" alt="picture" class="media-media" data-id="1">
        `
      } else if(mediaLength == 2) {
        mediaDiv.classList.add("two")
        mediaDiv.innerHTML = `
          <img src="${post.media[0]}" alt="picture" class="media-media" data-id="1">
          <img src="${post.media[1]}" alt="picture" class="media-media" data-id="2">
        `
      } else if(mediaLength == 3) {
        mediaDiv.classList.add("three")
        mediaDiv.innerHTML = `
          <img src="${post.media[0]}" alt="picture" class="media-media" data-id="1">
          <img src="${post.media[1]}" alt="picture" class="media-media one" data-id="2">
          <img src="${post.media[2]}" alt="picture" class="media-media one" data-id="3">
        `
      } else if(mediaLength == 4) {
        mediaDiv.classList.add("four")
        mediaDiv.innerHTML = `
          <img src="${post.media[0]}" alt="picture" class="media-media" data-id="1">
          <img src="${post.media[1]}" alt="picture" class="media-media" data-id="2">
          <img src="${post.media[2]}" alt="picture" class="media-media" data-id="3">
          <img src="${post.media[3]}" alt="picture" class="media-media" data-id="4">
          `
      }
      /* APPEND MEDIA DIV InnerHTML TO UsCapMedia Div*/
      usCapMediaDiv.innerHTML += `
        <div class="media ${mediaDiv.classList.value}">
          ${mediaDiv.innerHTML}
        </div>
        `
    }
    /*APPEND UsCapMedia InnerHTML to PostSubDiv */
    postSubDiv.innerHTML += `
      <div class="post-div"> 
        ${usCapMediaDiv.innerHTML}
      </div>`
    /* APPEND PostSubDiv InnerHTML to POSTDiv */
    postDiv.innerHTML =  `
      <div class="postSub">
        ${postSubDiv.innerHTML}
      </div>`
    /* CREATE POST ACTION DIV 
    A DIV FOR POST LIKE, COMMENT, SHARE COUNTS AND BTNS */
    let postActionDiv = document.createElement("div") //Post Action Div
    /* COUNT POST COMMENTS AND LIKES */
    let commentCount //The Number of comment the post has
    /*Check if post has a comment or it's undefined */
    if(post.postComment != null && post.postComment != 0) {
      commentCount = post.postComment //Get the number of comment post has
    } else {
      commentCount = ""
    }
    let postLikes;
    /*Check if post has likes or it's null
    create a Variable LikeTag to hold Temporary The InnerHTML of LikeDiv*/
    let likeTag
    if(post.likes != null && post.likes != 0) {
      //set postLikes to number of likes the post has
      postLikes = post.likes
      //check if user liked the post
      if(post.likedByUser != null && post.likedByUser != false) {
        likeTag = `
        <span class="material-icons-outlined likeIcon likeUser">
          favorite
        </span>
        <span class="like-count count">${postLikes}</span>
        `
      } else {
        likeTag = `
        <span class="material-icons-outlined likeIcon">
          favorite_border
        </span>
        <span class="like-count count">${postLikes}</span>
        `
      }
    } else {
      postLikes = ""
      likeTag = `
      <span class="material-icons-outlined likeIcon">
        favorite_border
      </span>
      <span class="like-count count">${postLikes}</span>
      `
    }
    /*APPEND LIKE DIV WITH LIKETAG INSIDE, COMMENT DIV WITH COMMENT COUNT AND SHARE DIV */
    postActionDiv.innerHTML = `
      <div class="comment"> 
        <span class="material-icons-outlined commentBtn">
          reply
        </span>
        <span class="comment-count count">${commentCount}</span>
      </div>
      <div class="like">
        ${likeTag}
      </div>
      <div class="share">
        <span class="material-icons-outlined">
          share
        </span>
      </div>`
    /* APPEND POST ACTION DIV InnerHTML to PostDiv*/
    postDiv.innerHTML += `
      <div class="post-actions">
        ${postActionDiv.innerHTML}
      </div>`
    //APPEND POST DIV TO HOMEFEED
    homeFeed.appendChild(postDiv)
  })
  likeSensor()
  commentSensor()
  zoomEffect()
}

getPost()

function likeSensor(){
  /* A FUNCTION TO LISTEN FOR POST LIKES 
  -QUERY ALL LIKE BTN AND ADD CLICk EVENT LISTENER*/
  allLikeIcon = document.querySelectorAll(".likeIcon")
  allLikeIcon.forEach(likeBtn => {
    likeBtn.addEventListener("click", likePost)
  })
}

async function likePost() {
  //A function to update the database whenever a post is liked or unliked
  let checker; //checker signifies if a post is liked(true) or unliked(false)
  /* CHECK IF POST IS LIKED BY USER 
  A POST LIKED BY USER HAS A CLASSLIST OF likeUser*/
  if(this.classList.contains("likeUser")) {
    checker = true //SET CHECKER TO TRUE TO SIGNIFY POST IS LIKED AND USER INTEND TO UNLIKE 
    this.classList.remove("likeUser") //REMOVE likeUser (MEANING UNLIKE POST)
    this.innerHTML = "favorite_border" //change Icon (change like Icon back to transparent/white)
    //Get The Likes Count and decrease by 1
    let likeCount = parseInt(this.nextElementSibling.innerText) - 1//convert to Int
    this.nextElementSibling.innerHTML = likeCount //update nextElementSibling
    if(likeCount == 0) this.nextElementSibling.innerHTML = "" //IF likecount is 0, Display "" instead of 0
  } else {
    /* WHEN POST IS LIKED*/
    checker = false //SET CHECKER TO FALSE TO SIGNIFY POST IS UNLIKED AND USER INTEND TO LIKE
    this.classList.add("likeUser") //Add likeUser (Meaning Like Post)
    this.innerHTML = "favorite" //change icon (change like Icon to Red)
    //Get The Likes Count and increment by 1
    let likeCount = this.nextElementSibling.innerText //convert to Int 
    if(likeCount.length == 0 ) likeCount = 0 //set likeCount to 0 from empty string
    likeCount = parseInt(likeCount) //convert likeCount to Int
    likeCount += 1
    this.nextElementSibling.innerHTML = likeCount
  } 
  // Get The Id of The Post 
  let postId = this.parentElement.parentElement.parentElement.getAttribute("id") //Get The Post Id 
  postId = postId.slice(2) //cut out the letters 'ID' from the Id attribute 
  try {
    await axios.post("/myInfo/like", {
      checker,
      postId
    })
  } catch (error) {
    console.log(error.response.data)
  }
  console.log(postId, checker)
}

let commentReply = document.querySelector(".comment-reply") //Comment Reply section div
let body = document.querySelector("body") //DOM body Element
let cancelReply = document.querySelector(".reply-main .return-controls .return-btn") //Cancel Btn for Comment Reply Section Div
let postBtn = commentReply.querySelector(".reply-main .return-controls .send-reply") //POST Btn to post a comment 
let uploadFiles = document.querySelector("#reply-upload") //File Input for Media 
let kelpost = document.querySelector(".post-actions #reply-post") //kelpost Area (Area to type text) 
let uploadedFilesDiv = document.querySelector(".post-actions .uploads-images") //Div to Display Media Files that are selected by User For Upload 
let commentPostId; //Hold The Post Id of The Post To Be Commented On
let postingLoader = document.querySelector(".post-loader") //the loading effect to show a post or comment is posting 
let uploadSection = document.querySelector(".upload-section") //the upload message to show a post or comment was made
let uploadMessage = uploadSection.querySelector(".upload-messages p") //the message to show for upload of post or comment

/* A FUNCTION TO ADD EVENTLISTENER TO ALL COMMENTS AND 
POP UP A COMMENT SECTION REPLY FOR POST*/
function commentSensor() {
  //GET ALL THE COMMENT BTN
  let allCommentBtn = document.querySelectorAll(".commentBtn") //All CommentBtn
  //Loop Through and Add EventListener
  allCommentBtn.forEach(btn => {
    /* WHEN A COMMENT BTN IS CLICKED, GET THE POST INFORMATIONS 
    User's Profile Picture, Post Username, PostText, PostId*/
    btn.addEventListener("click", (e)=>{
      let postImage = e.target.parentElement.parentElement.parentElement.children[0].children[0].children[0].src //Get the profilePicture of the user 
      let postUsername = e.target.parentElement.parentElement.parentElement.children[0].children[1].children[0].children[0].innerHTML //get the username
      let postText = e.target.parentElement.parentElement.parentElement.children[0].children[1].children[0].children[1].children[0].innerHTML //get the post text 
      let postId = e.target.parentElement.parentElement.parentElement.getAttribute("id").slice(2) //get the post Id
      commentPostId = postId //set commentPostId to postId 
      changePostReply(postImage, postUsername, postText) //UNIQUELY FIX POST INFO IN COMMENT SECTION WHEN COMMENT BTN IS CLICKED
      pageTitle.innerHTML = "Compose Post Reply" //Change The Page Title to Compose Post Reply 
      body.classList.add("visible") //Add Visible to Body to prevent Body from scrolling 
      commentReply.classList.add("visible") //display comment reply section div
      postBtn.classList.add("comment") //add comment to postBtn classList to signify a comment
    })
  })
}
/* HANDLE POSTING FOR COMMENTS
FIRST CHECK IF POST BTN CONTAINS COMMENT (Comment signify it's a comment)
Using FormData 
-Append PostId and caption 
then check if Comment has Media Files */
postBtn.addEventListener("click", async()=>{
  //check if postBtn is enabled and it contains comment to signify a comment 
  if(!postBtn.classList.contains("error") && postBtn.classList.contains("comment")) {
    let form = new FormData()
    let postId = commentPostId //Get PostId
    let caption = kelpost.innerHTML.trim() //Get Caption
    form.append("caption", kelpost.innerHTML) //get the caption for the comment 
    form.append("postId", commentPostId) //get the reference post Id 
    /* CURRENT MEDIA IS AN ARRAY OF MEDIA FILES TO BE UPLOADED  
    Check is Comment Has Media Files */
    if(currentMedia) {
      //Loop through currentMedia if there is a media file 
      currentMedia.forEach(file => {
        form.append("fileInput", file) //APPEND MEDIA TO FORM 
      })
    }
    cancelReplyBar() //cancel comment||post bar, redirect to home while you upload comment
    postingLoader.classList.remove("display-off") //display loading Bar for comment upload 
    try {
      //first check if the comment is a duplicate comment
      await axios.post("/postKel/duplicate", { caption, postId }, {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
      })
      /* IF Comment is not a Duplicate, upload comment */
      let comment = await axios.post("/postKel/comment", form, {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
      })
      console.log(comment)
      postingLoader.classList.add("display-off") //remove loading Bar
      uploadMessage.innerHTML = "your reply was sent" //show this for upload Message 
      uploadSection.classList.remove("display-off") //show upload Message 
      let uploadTimer = setTimeout(() => {
        uploadSection.classList.add("display-off")
      }, 3000) //turn off Upload message after 3s
    } catch (error) {
      postingLoader.classList.add("display-off") //remove loading Bar
      console.error(error.response.data)
      //IF Comment is a Duplicate 
      if(error.response.data == "Comment duplicate") {
        uploadMessage.innerHTML = "Whoops!! You already said that" //show this for upload Message 
        uploadSection.classList.remove("display-off") //show upload Message 
        uploadSection.classList.add("error") //show error
        let uploadTimer = setTimeout(() => {
          uploadSection.classList.add("display-off") //remove upload message div
          uploadSection.classList.remove("error") //remove error
        }, 2500) //turn off Upload message after 3s
      } else {
        uploadMessage.innerHTML = "Error Sending Reply" //show this for upload Message 
        uploadSection.classList.remove("display-off") //show upload Message 
        uploadSection.classList.add("error") //show error
        let uploadTimer = setTimeout(() => {
          uploadSection.classList.add("display-off") //remove upload message div
          uploadSection.classList.remove("error") //remove error
        }, 2500) //turn off Upload message after 3s
      }
    }
  } else console.log("type something abeg")
})

/* FOR COMMENT SECTION
replyPostDesign is the Div to hold the Exact Post Authors Profile's Picture
replyPostDiv is the div to hold the Exact Post Author's Username and Caption of Post To Be Commented on*/
let replyPostDesign = document.querySelector(".comment-reply .reply-main .exact-post-reply .image-design")
let replyPostDiv = document.querySelector(".exact-post-reply .post-div")

//Cancel Btn For Comment Reply Section Div
cancelReply.addEventListener("click", cancelReplyBar)

/* When Cancel Comment Reply Section is Clicked 
Reset Comment Reply Section*/
function cancelReplyBar() {
  //A FUNCTION TO RESET COMMENT REPLY SECTION
  postBtn.classList.remove("comment") //remove comment from postBtn
  uploadFiles.value = null //remove all files in fileInput
  kelpost.innerHTML = "" //set text input to null
  countPostArea()
  uploadedFilesDiv.innerHTML = "" //remove all media files if any 
  postBtn.classList.add("error") //disable postBtn
  commentPostId = "" //reset commentPostId
  pageTitle.innerHTML = "Kelchat" //Change Page Title Back to Kelchat
  replyPostDesign.innerHTML = "" //Set replyPostDesign to nill
  replyPostDiv.innerHTML = ""
  commentReply.classList.remove("visible") //Disable Comment Reply Section 
  body.classList.remove("visible") //Make Body Scrollable 
}

/*A FUNCTION TO UNIQUELY FIXED POST INFO IN COMMENT SECTION WHEN COMMENT BTN IS CLICKED */
function changePostReply(image, username, text) {
  replyPostDesign.innerHTML = `
    <img src="${image}" alt="profile-picture" class="reply-image">
    <div class="design"></div>` //For Post Author's Profile Picture 
  replyPostDiv.innerHTML = `
    <span class="username">${username}</span>
    <div class="post-text">
      <p class="text-text">${text}</p>
    </div>` //For Post Author's Username and Post Caption
}

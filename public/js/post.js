import { zoomEffect } from "./zoomNew.js";
const socket = io();
socket.on("Message", msg => {
  console.log(msg)
});

/*A FUNCTION TO GET USER'S INFORMATION 
PROFILE PICTURE, FOLLOWING AND FOLLOWERS*/
let usersInfo; //Hold User's Info Gotten From Database
/* GET THE POST REPLY AND COMMENT POP UP USER"S IMG TAG 
POST REPLY USER"S IMG TAG IS THE USER"S PROFILE PICTURE THAT SHOWS IN THE REPLY BOX UNDERNEATH A POST AND 
COMMENT POP UP USER"S IMG TAG IS THE USER"S PROFILE PICTURE THAT SHOWS IN THE COMMENT SECTION WHEN A USER CLICKS ON A COMMENT BTN AND 
A COMMENT SECTION POPS UP */
let pRCImg = document.querySelector(".main-main-post .post-sub-section .reply-profile")
let cPUImg = document.querySelector(".comment-reply .post-section .post-sub-section .reply-profile")
async function getInfo() {
  try {
    let {data} = await axios.get("/myInfo/info")
    console.log(data)
    usersInfo = data;
    pRCImg.src = data[0].profilePicture //SET POST REPLY USER"S IMG TAG 
    cPUImg.src = data[0].profilePicture //SET COMMENT POP UP USER"S IMG TAG
    // userProfileImage.innerHTML = `
    // <img src="${data.profilePicture}" alt="">` //Set User' Profile Picture
    // commentProfileImage.src = data.profilePicture //Set Current User's Profile Image for Comment Reply Section
    const userFollowing = [] //An Array For Current User Following Lists 
    //Append All the usernames of User's Current user is following to userFollowing List 
    data[0].following.forEach((user, index) => {
      userFollowing.push(user.username) //Push Username
    })
    socket.emit("Login", {
      username: data.username,
      followers: userFollowing
    })
  } catch (error) {
    console.log(error.response.data)
  }
}

getInfo() //get user's info

$(document).ready(function (){
    /* THERE ARE TWO EMOJI"S 
    ONE FOR POST REPLY SECTION AND ONE FOR COMMENT POP UP */
    //Emoji for POST REPLY SECTION
    $("#myEmoji").emojioneArea({
        pickerPosition: "bottom"
    })
    var el = $("#myEmoji").emojioneArea();
    el[0].emojioneArea.on("emojibtn.click", function(btn, event) {
        addEmoji(el[0].emojioneArea.getText())
        el[0].emojioneArea.setText("")
    });
    //EMOJI FOR COMMENT POP UP 
    $("#myEmoji1").emojioneArea({
      pickerPosition: "bottom"
    })
    var el1 = $("#myEmoji1").emojioneArea();
    el1[0].emojioneArea.on("emojibtn.click", function(btn, event) {
        addEmoji1(el1[0].emojioneArea.getText())
        el1[0].emojioneArea.setText("")
    });


    $("#myEmoji").emojioneArea({
        events: {
          paste: function (editor, event) {
            console.log('event:paste');
          },
          change: function (editor, event) {
            console.log('event:change');
          },
          click: function (editor, event) {
            console.log('event:change');
          },
          emojibtn_click: function (button, event) {
            console.log('event:emojibtn.click, emoji=' + button.children().data("name"));
          }
        }
      });
    el[0].emojioneArea.on("button.click", function(btn, event) {
        scroll()
    })
})

/* postReplyContainer is the reply section directly under a post to reply/comment on Post */
let postReplyContainer = document.querySelector(".main-route-post-div .post-sub-section") //The Reply Box directly under a Post 
/* GET THE POST OR COMMENT URL FOR WINDOW.LOCATION */
const postUrl = window.location.pathname.split("/") //Get the Url of the post or comment 
const postId = postUrl[postUrl.length - 1] //Get the postId from the URL
let loadingDiv = document.querySelector("#main-container .loading-div") //The Loading Effect You See When Fetching Data About Post 
/* mainMainPostDiv is a Div that contains the POST INFO, COMMENT REFERENCES and postReplyContainer for reply/comment on Post */
let mainMainPostDiv = document.querySelector("#main-container .main-main-post") //The Main Post Div for Post Info.
let backBtn = document.querySelector(".page-header .return-btn") //The Back Btn To Go Back In Window's History 
/* postCommentDiv is the parent Div to Hold all post Comments */
let postCommentDiv = document.querySelector("#main-container .post-comments")
/* ADD AN EVENTLISTENER TO BACK BTN 
GO BACK IN HISTORY WHEN BACK BTN IS CLICKED*/
backBtn.addEventListener("click", ()=>{
    window.history.back() //Go Back In Window History when Back Btn Is Clicked 
})

/* ADD SCROLL EFFECT WHEN EMOJI BTN IS CLICKED ON A SMALL SCREEN */
function scroll() {
    //scrollTo Effect when emoji pop up shows on small screen
    window.scrollTo({
        top: postReplyContainer.scrollHeight + 250,
        behavior: 'smooth'
      });
}

/* GET INFORMATION ABOUT THE POST OR COMMENT
USING URL GET THE POST ID */
async function getPostInfo() {
    mainMainPostDiv.classList.add("loading") //set mainMainPostDiv to display None
    let postInfo; //set postInfo to hold Infomation about the Post 
    try {
        let {data} = await axios.post("/user/postInfo", {
            postId
        })
        postInfo = data //set postInfo 
    } catch (error) {
        console.error(error.response.data)
    }
    console.log(postInfo)
    arrangePostInfo(postInfo) //Arrange Post Info 
    loadingDiv.classList.add("loaded") //Stop Displaying Loading Effect 
    mainMainPostDiv.classList.remove("loading") //Display mainMainPostDiv
    /* LOOP THROUGH ALL COMMENTS FOR POST AND APPEND EACH COMMENT TO POST COMMENT DIV */
    postInfo[0].postComment.forEach(comment => addPostComment(comment, postCommentDiv));
    likeSensor() //ADD EVENT LISTENER FOR LIKE ICON 
    commentSensor() //ADD EVENT LISTENER FOR ALL COMMENT BTN 
    /* ENABLE ZOOM EFFECT*/
    zoomEffect()
}

getPostInfo()

/* HOLD THE ID FOR PAGE POST, 
easier to retrive when uploading comments*/
let mainPostId; 
/* ARRANGE POST INFO */
function arrangePostInfo(data) {
    //A Function to arrange the data of the post Info when gotten from the API 
    /* mainPostDiv is a Div Inside mainMainPostDiv that contains Post Info and postReplyContainer */
    let mainPostDiv = mainMainPostDiv.querySelector(".main-route-post-div") //The Main Div for post info 
    /* Set The Id of mainPostDiv to the Id of Data(post) */
    mainPostDiv.setAttribute("id", `id${data[0]._id}`)
    mainPostId = data[0]._id //Set mainPostId to post Id from Database
    /* Get The User's Profile Picture Tag */
    let postProfilePicture = mainPostDiv.querySelector(".user-info-div .user-info-profile") //User's Profile Picture 
    postProfilePicture.src = data[0].postedBy.profilePicture //set the post User's profile Picture to postedBy profilePicture from data
    let postUsername = mainPostDiv.querySelector(".user-info-div .user-info-username") //Post's Username 
    postUsername.innerHTML = data[0].postedBy.username //Set The Post Username to postedBy Username from Data 
    let postCaption = mainPostDiv.querySelector(".post-text .text-text") //post caption
    postCaption.innerHTML = data[0].caption //set post caption to data caption 
    let postMedia = mainPostDiv.querySelector(".media") //Div to hold post Media files either images or video 
    let mediaLength = data[0].media.length //Get the media Length from the API 
    switch (mediaLength) {
        //switch through length of post and add the various classList depending on the length of the post Media API for CSS effect
        case 2:
            //for two files
            postMedia.classList.add("two")
            break;
        case 3: 
            //for 3 files
            postMedia.classList.add("three")
            break;
        case 4: 
            postMedia.classList.add("four")
        default:
            break;
    }
    data[0].media.forEach((media, index) => {
        //loop through media from API and append each media file
        //If the value of MediaLength is 3, Add a special styling for first Media File if Media Length is 3
        if(mediaLength == 3 && (index == 1 || index == 2)) postMedia.innerHTML += `<img src="${media}" alt="username" class="media-media one" data-id="${index + 1}">`
        else postMedia.innerHTML += `<img src="${media}" alt="username" class="media-media" data-id="${index + 1}">`
    })
    let postTime = mainPostDiv.querySelector(".main-post-time .time-time") //The Post Time Element Tag in mainPostDiv to hold the Time post was made
    let postDate = mainPostDiv.querySelector(".main-post-time .date-time") //The Post Date Element Tag in mainPostDiv to hold the date post was made
    let APIPostTime = new Date(data[0]._createdAt) //Create a Date object from the time post was createdAt 
    let APITime = localeTime(APIPostTime) //convert date to 1:50 PM and Sept 11, 2022 format 
    postTime.innerHTML = APITime.time //set POST Time to time from APiTime 
    postDate.innerHTML = APITime.date //set post Date to date from APIDate 
    let postLikesCount = mainPostDiv.querySelector(".action-counter .like-count-div .like-like") //The Post Like count 
    postLikesCount.innerHTML = data[0].likesCount //Set postLikesCount to number of likes 
    /* Post Like Tag is the Like(heart) btn for the mainPost */
    let postLikeTag = mainPostDiv.querySelector(".post-actions-icons .like")
    /* CHECK IF USER LIKED POST OR NOT 
    IF USER LIKED THE POST CHANGE LIKE BTN TO A RED BTN */
    if(data[0].likedByUser != undefined) {
        //Meaning User Liked the Post
        postLikeTag.innerHTML = `
        <span class="material-icons-outlined likeIcon likeUser">
          favorite
        </span>
        `
      } else {
        postLikeTag.innerHTML = `
        <span class="material-icons-outlined likeIcon">
          favorite_border
        </span>
        `
      }
}

function localeTime(time) {
    //A Function to take in ISO localeTimeString and return it in this format 1:50 PM and Sept 11, 2022
    /*convert Time to a LocaleTimeString and split between spaces to have two elements in the array. 
    one for HR:MM:SS and the other for AM or PM
    */
    let timeArray = time.toLocaleTimeString().split(" ")
    let timeTimeArray = timeArray[0].split(":") //Split the Time Interval Array by : to get [HR, MM, SS]
    let timeString = `${timeTimeArray[0]}:${timeTimeArray[1]} ${timeArray[1]}` //return time in HR:MM AM/PM format
    let dateArray = time.toDateString().split(" ") //convert time to DateString and split between spaces to get ["MON", "AUG", "23", "2022"] format 
    let date = `${dateArray[1]} ${dateArray[2]}, ${dateArray[3]}` //retun date in AUG 23, 2022 format 
    return {
        time: timeString, 
        date
    }
}

/* A FUNCTION THAT TAKES AN ARRAY OF COMMENTS (POST COMMENTS)
AND CREATE AND APPEND EACH ELEMENT TO postCommentDiv
FEED IS THE PARENT DIV(COMMENT DIV) WHERE ALL COMMENTS WILL BE ADDED TO */
function addPostComment(commentInfo, feed) {
  let commentDiv = document.createElement("div") //create a commentDiv as ParentDiv for comment details
  commentDiv.classList.add("post")
  commentDiv.setAttribute("id", `id${commentInfo._id}`) //set id to comment ID from the database
  /* EACH COMMENT SITS INSIDE A COMMENT DIV WHICH CONSISTS OF TWO DIVS 
  THE COMMENT SUB DIV AND THE COMMENT ACTION DIV */
  /*FIRST CREATE THE COMMENT SUB DIV 
  A DIV TO HOLD PROFILE PICTURE, USERNAME, CAPTION AND MEDIA FILES IF ANY */
  let commentSubDiv = document.createElement("div") //COMMENT SUB DIV 
  /* For COMMENT SUB DIV, FIRST APPEND THE COMMENT PROFILE PICTURE */
  commentSubDiv.innerHTML = `
    <a href="/comment/${commentInfo.postedBy.username}/${commentInfo._id}">
      <img src="${commentInfo.postedBy.profilePicture}" alt="${commentInfo.postedBy.username}_profilePicture" class="profile-picture">
    </a>` //A Tag Href is a Link to comment information. 
  /* CREATE ANOTHER DIV TO HOLD USERNAME, CAPTION AND MEDIA FILES IF ANY */
  let usCapMediaDiv = document.createElement("div") //US for Username, Cap for Caption
  usCapMediaDiv.innerHTML =  `
    <a href="/user/${commentInfo.postedBy.username}/${commentInfo._id}">
      <span class="username">${commentInfo.postedBy.username}</span>
      <div class="post-text">
        <p class="text-text">${commentInfo.caption}</p>
      </div>
    </a>`
  /* CHECK IF COMMENT HAS MEDIA FILES, IF IT DOES CREATE A DIV FOR IT */
  let mediaLength = commentInfo.media.length //Get The Media Length of Comment
  if(mediaLength != 0) {
    //If Comment has Media
    let mediaDiv = document.createElement("div"); //create Media Div
    /* Depending on the Length of Comment Media File, Style it*/
    if(mediaLength == 1) {
      mediaDiv.innerHTML = `
        <img src="${commentInfo.media[0]}" alt="picture" class="media-media" data-id="1">
      `
    } else if(mediaLength == 2) {
      mediaDiv.classList.add("two")
      mediaDiv.innerHTML = `
        <img src="${commentInfo.media[0]}" alt="picture" class="media-media" data-id="1">
        <img src="${commentInfo.media[1]}" alt="picture" class="media-media" data-id="2">
      `
    } else if(mediaLength == 3) {
      mediaDiv.classList.add("three")
      mediaDiv.innerHTML = `
        <img src="${commentInfo.media[0]}" alt="picture" class="media-media" data-id="1">
        <img src="${commentInfo.media[1]}" alt="picture" class="media-media one" data-id="2">
        <img src="${commentInfo.media[2]}" alt="picture" class="media-media one" data-id="3">
      `
    } else if(mediaLength == 4) {
      mediaDiv.classList.add("four")
      mediaDiv.innerHTML = `
        <img src="${commentInfo.media[0]}" alt="picture" class="media-media" data-id="1">
        <img src="${commentInfo.media[1]}" alt="picture" class="media-media" data-id="2">
        <img src="${commentInfo.media[2]}" alt="picture" class="media-media" data-id="3">
        <img src="${commentInfo.media[3]}" alt="picture" class="media-media" data-id="4">
        `
    }
    /* APPEND MEDIA DIV InnerHTML TO UsCapMedia Div*/
    usCapMediaDiv.innerHTML += `
      <div class="media ${mediaDiv.classList.value}">
        ${mediaDiv.innerHTML}
      </div>
      `
  }
  /*APPEND UsCapMedia InnerHTML to commentSubDiv */
  commentSubDiv.innerHTML += `
    <div class="post-div"> 
      ${usCapMediaDiv.innerHTML}
    </div>`
  /* APPEND commentSubDiv InnerHTML to COMMENTDiv */
  commentDiv.innerHTML =  `
    <div class="postSub">
      ${commentSubDiv.innerHTML}
    </div>`
  /* CREATE COMMENT ACTION DIV 
  A DIV FOR COMMENT LIKE, COMMENT, SHARE COUNTS AND BTNS */
  let commentActionDiv = document.createElement("div") //Post Action Div
  /* COUNT POST COMMENTS AND LIKES */
  let commentCount //The Number of comment the post has
  /*Check if Comment has a comments under or it's undefined */
  if(commentInfo.replies != undefined && commentInfo.replies.length != 0) {
    commentCount = commentInfo.replies.length //count the comment
  } else {
    commentCount = ""
  }
  let commentLikes;
  /*Check if comment has likes or it's undefined 
  create a Variable LikeTag to hold Temporarily The InnerHTML of LikeDiv
  LikeDiv is a DIV that to hold like icons, red when comment is Liked by User and White when it's not */
  let likeTag;
  /* CHECK IF COMMENT HAS LIKES */
  if((commentInfo.commentLike != undefined || commentInfo.commentLike != null) && commentInfo.commentLike.length != 0 ) {
    //set commentLikes to number of likes the comment has
    commentLikes = commentInfo.commentLike.length
    //check if user liked the comment
    if(commentInfo.likedByUser != undefined) {
      /* IF COMMENT IS LIKED BY USER SET LIKE ICON TO A RED ICON */
      likeTag = `
      <span class="material-icons-outlined likeIcon likeUser">
        favorite
      </span>
      <span class="like-count count">${commentLikes}</span>
      `
    } else {
      /* ELSE, IF COMMENT IS NOT LIKED BY USER SET LIKE ICON TO A WHITE/TRANSPARENT ICON */
      likeTag = `
      <span class="material-icons-outlined likeIcon">
        favorite_border
      </span>
      <span class="like-count count">${commentLikes}</span>
      `
    }
  } else {
    /* IF COMMENT DOESN'T HAVE ANY LIKE 
    SET LIKE ICON TO WHITE/TRANSPARENT ICON and LIKE COUNT TO NILL */
    commentLikes = ""
    likeTag = `
    <span class="material-icons-outlined likeIcon">
      favorite_border
    </span>
    <span class="like-count count"></span>
    `
  }
  /*APPEND LIKE TAG, COMMENT COUNT TO COMMENT ACTION DIV 
  ALSO ADD A SHARE DIV */
  commentActionDiv.innerHTML = `
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
  /* APPEND COMMENT ACTION DIV InnerHTML to COMMENTDiv*/
  commentDiv.innerHTML += `
    <div class="post-actions">
      ${commentActionDiv.innerHTML}
    </div>`
  //APPEND COMMENT DIV TO COMMENT FEED
  feed.appendChild(commentDiv)
}

/* UPDATE TEXT COUNT TO KNOW IF A USER HAS EXCEEDED MAX CHAR ACCEPTED
THERE ARE TWO AREAS FOR USER TO INPUT TEXT(COMMENT) 
POST REPLY SECTION AND COMMENT POP UP SECTION 
POST REPLY SECTION IS THE REPLY BOX UNDERNEATH A POST FOR USER TO UPLOAD COMMENT WHILE 
COMMENT POP UP IS THE REPLY BOX THAT POPS UP WHEN YOU CLICK ON COMMENT BTN FOR ANY COMMENT */

/* HANDLE POST REPLY SECTION */
/* HANDLE POST REPLY SECTION */
/* HANDLE POST REPLY SECTION */
/*PercentCount is the circle that shows the percentage of Charaters Inputed into post reply section(The Max Chars Accepted is 280) */
let percentCount = postReplyContainer.querySelector(".percent-count.count-true")
/* KelPost is the Text Input area where a User types response or comment for the Post (Post Reply Section) */
let kelpost = postReplyContainer.querySelector(".post-actions #reply-post") 
let replyPostBtn = postReplyContainer.querySelector(".actions-action .send-reply-reply") // REPLY/POST btn for post Reply Section 
/* FRONTCOUNTDIV is a Div that Holds the PercentCount and the replyBtn for Post Reply Section */
let frontCountDiv = postReplyContainer.querySelector(".actions-action .front-count")
/* COUNT is the Div that holds PercentCount and the Number that represents the exact textcharacter in Kelpost */
let count = frontCountDiv.querySelector(".card") 
/* remainingText is the an Element Tag That holds the Exact TextCharacter in Kelpost 
Mainly Used to display if a User has Exceeded the Total Character */
let remainingText = count.querySelector(".number h3")  
let uploadFiles = postReplyContainer.querySelector("#reply-upload") //input type file for media for post reply section 
let uploadedFilesDiv = postReplyContainer.querySelector(".post-actions .uploads-images") //div to hold all upload media for post reply section

/* ADD EVENT LISTENER TO REPLY POST BTN TO POST A COMMENT */
replyPostBtn.addEventListener("click", uploadPC)

function uploadPC() {
  /* First check if replyPostBtn doesn't contain a className ERROR 
  ERROR is Used when a post has no text characters or media files */
  if(!replyPostBtn.classList.contains("error")) {
    //console.log(postCommentDiv.children)
    let newCommentInfo = {
      postedBy: {
        profilePicture: usersInfo[0].profilePicture,
        username: usersInfo[0].username
      },
      caption: kelpost.textContent.trim(),
      media: currentMedia
    }
    addNewComment(newCommentInfo, postCommentDiv)
    uploadPostCommment(kelpost.textContent.trim(), currentMedia, newCommentInfo.postedBy.username)
    likeSensor() //ADD EVENT LISTENER FOR LIKE ICON 
    commentSensor() //ADD EVENT LISTENER FOR ALL COMMENT BTN 
    /* ENABLE ZOOM EFFECT*/
    zoomEffect()
  }
}

async function uploadPostCommment(caption, files, username) {
  let form = new FormData()
  // let caption = kelpost.textContent.trim() //Get Caption of Comment 
  form.append("caption", caption) //get the caption for the comment 
  form.append("postId", mainPostId) //get the reference post Id 
  /* CURRENT MEDIA IS AN ARRAY OF MEDIA FILES TO BE UPLOADED  
  Check is Comment Has Media Files */
  if(currentMedia) {
    //Loop through currentMedia if there is a media file 
    files.forEach(file => {
      form.append("fileInput", file) //APPEND MEDIA TO FORM 
    })
  }
  clearPRSection() //clear post reply comment section
  // postingLoader.classList.remove("display-off") //display loading Bar for comment upload 
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
    console.log(comment.data)
    updateNewComment(comment, username)
  } catch (error) {
    // postingLoader.classList.add("display-off") //remove loading Bar
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
    postCommentDiv.removeChild(postCommentDiv.children[0])
  }
}

/* A FUNCTION TO ADD COMMENTS TO A POST VIA POST REPLY SECTION */
function addNewComment(commentInfo, feed) {
  let commentDiv = document.createElement("div") //create a commentDiv as ParentDiv for comment details
  /* Add post for default comment styling and loading-post to signify post is being uploaded*/
  commentDiv.classList.add("post", "loading-post") 
  // commentDiv.setAttribute("id", `id${commentInfo._id}`) //set id to comment ID from the database
  /* EACH COMMENT SITS INSIDE A COMMENT DIV WHICH CONSISTS OF TWO DIVS 
  THE COMMENT SUB DIV AND THE COMMENT ACTION DIV */
  /*FIRST CREATE THE COMMENT SUB DIV 
  A DIV TO HOLD PROFILE PICTURE, USERNAME, CAPTION AND MEDIA FILES IF ANY */
  let commentSubDiv = document.createElement("div") //COMMENT SUB DIV 
  /* For COMMENT SUB DIV, FIRST APPEND THE COMMENT PROFILE PICTURE */
  commentSubDiv.innerHTML = `
    <a href="">
      <img src="${commentInfo.postedBy.profilePicture}" alt="${commentInfo.postedBy.username}_profilePicture" class="profile-picture">
    </a>` //A Tag Href is a Link to comment information. 
  /* CREATE ANOTHER DIV TO HOLD USERNAME, CAPTION AND MEDIA FILES IF ANY */
  let usCapMediaDiv = document.createElement("div") //US for Username, Cap for Caption
  usCapMediaDiv.innerHTML =  `
    <a href="">
      <span class="username">${commentInfo.postedBy.username}</span>
      <div class="post-text">
        <p class="text-text">${commentInfo.caption}</p>
      </div>
    </a>`
  /* CHECK IF COMMENT HAS MEDIA FILES, IF IT DOES CREATE A DIV FOR IT */
  if(commentInfo.media) {
    //If Comment has Media
    let mediaLength = commentInfo.media.length //Get The Media Length of Comment
    let mediaDiv = document.createElement("div"); //create Media Div
    /* Depending on the Length of Comment Media File, Style it*/
    switch (mediaLength) {
      case 2:
        mediaDiv.classList.add("two")
        break;
      case 3: 
        mediaDiv.classList.add("three")
        break;
      case 4: 
        mediaDiv.classList.add("four")
        break;
      default:
        break;
    }
    /* LOOP THROUGH CURRENT FILES, CONVERT EACH FILE TO A BlobURL and CREATE AN IMAGE TAG FOR IT, APPEND IMAGE TO MEDIA DIV */
    commentInfo.media.forEach((media, index) => {
      let blobURL = URL.createObjectURL(media) //convert it to a blob
      let image = document.createElement("img") //create the img
      image.src = blobURL
      image.alt = "picture" //Create an Alt for Images
      image.classList.add("media-media") //Add Classname Media-Media to Images
      /* IF CURRENT MEDIA LENGTH IS 3, Add a Class name of one for the Second and third media/img files */
      if(mediaLength = 3 && (index == 1 || index == 2)) image.classList.add("one")
      image.setAttribute("data-id", `${index + 1}`) //Set data-id attribute to the number of occurance of img/media files
      mediaDiv.append(image)
    })
    /* APPEND MEDIA DIV InnerHTML TO UsCapMedia Div*/
    usCapMediaDiv.innerHTML += `
      <div class="media ${mediaDiv.classList.value}">
        ${mediaDiv.innerHTML}
      </div>
      `
  }
  /*APPEND UsCapMedia InnerHTML to commentSubDiv */
  commentSubDiv.innerHTML += `
    <div class="post-div"> 
      ${usCapMediaDiv.innerHTML}
    </div>`
  /* APPEND commentSubDiv InnerHTML to COMMENTDiv */
  commentDiv.innerHTML =  `
    <div class="postSub">
      ${commentSubDiv.innerHTML}
    </div>`
  /* CREATE COMMENT ACTION DIV 
  A DIV FOR COMMENT LIKE, COMMENT, SHARE COUNTS AND BTNS */
  let commentActionDiv = document.createElement("div") //Post Action Div
  /*APPEND LIKE TAG, COMMENT COUNT TO COMMENT ACTION DIV 
  ALSO ADD A SHARE DIV */
  commentActionDiv.innerHTML = `
    <div class="comment"> 
      <span class="material-icons-outlined commentBtn">
        reply
      </span>
      <span class="comment-count count"></span>
    </div>
    <div class="like">
      <span class="material-icons-outlined likeIcon">
        favorite_border
      </span>
    </div>
    <div class="share">
      <span class="material-icons-outlined">
        share
      </span>
    </div>`
  /* APPEND COMMENT ACTION DIV InnerHTML to COMMENTDiv*/
  commentDiv.innerHTML += `
    <div class="post-actions">
      ${commentActionDiv.innerHTML}
    </div>`
  //INSERT COMMENT DIV BEFORE THE FIRST ELEMENT OF COMMENT FEED 
  feed.insertBefore(commentDiv, feed.children[0]);
}

  //  <a href="/comment/${commentInfo.postedBy.username}/${commentInfo._id}">
/* A FUNCTION TO UPDATE NEW COMMENTS AFTER UPLOAD 
WHEN A COMMENT IS UPLOADED FROM POST REPLY SECTION A DIV IS SHOwED FIRST WITH INFO ABOUT THE COMMENT,
AFTER COMMENT UPLOAD, UPLOAD THE COMMENT ID AND COMMENT ROUTES*/
function updateNewComment(commentId, username) {
  postCommentDiv.children[0].classList.remove("loading-post")
  postCommentDiv.children[0].setAttribute("id", commentId)
  let allALink = postCommentDiv.children[0].querySelectorAll("a")
  allALink.forEach(a => a.href = `/comment/${username}/${commentId}`)
}

function addEmoji(emoji) {
    //a function to add emoji to text area for POST REPLY SECTION 
    /* Kelpost is the Text Input area for POST REPLY SECTION */
    kelpost.textContent += emoji //add emoji to text input
    /* countPostArea is a Function to count Text in Kelpost to know if User has exceeded max chars */
    countPostArea(kelpost, count, replyPostBtn, frontCountDiv, percentCount, remainingText)
}

/* ADD AN EVENTLISTENER TO KELPOST TO LISTEN FOR EACH INPUT */
kelpost.addEventListener("input", addText) 

/* A FUNCTION TO ADD TEXT TO REPLY POST SECTION */
function addText() {
    //WHENEVER A USER INPUT"S A TEXT IN KELPOST CHECK IF MAX CHAR ACCEPTED IS EXCEEDED
    countPostArea(kelpost, count, replyPostBtn, frontCountDiv, percentCount, remainingText)
}

/* CountPostArea is a Function that counts the text in Post/Comment Reply Section and Indicate if Reply Section 
has exceeded max number of Char accepted 
It takes in 6 arguments 
textArea - is the input type to implement count either Post/Comment Reply Section 
counter - counter is the Div withing the reply section that holds the percentCount display and the number to indicate the exact number of characters typed by User 
postBtn - the postBtn of the reply section 
counterDiv - counterDiv is the Div that holds the percentageCount and the postBtn 
percentage -  PercentCount is the circle that shows the percentage of Charaters Inputed in to The Max Chars Accepted (280) 
h3Count - holds the Exact Number of Characters in Reply Section */
function countPostArea(textArea, counter, postBtn, counterDiv, percentage, h3Count) {
    //a function to add text or emoji to reply/comment input section.
    /*FIRST GET THE LENGTH OF TextArea */
    let textLength = textArea.textContent.length //get the length of the post either post reply section or comment reply section 
    let circles = counter.querySelectorAll("svg .percent-count")//get the circles for percentage representation
    //A function to count text in reply/post area 
    if(textLength != 0) {
        counter.classList.remove("error") //remove error class from count (show percentage counter)
        counter.classList.remove("error-svg") //remove error-svg class from count 
        postBtn.classList.remove("error") //enable post btn
        counterDiv.classList.remove("count-disabled") //remove disabled and show the parent div of counter (it shows percentage count and post btn)
        let percent = (textLength / 280) * 100 //get the percentage of the text (Max character accepted is 280)
        if(textLength < 280) {
            //If post is less than 280, max character for post is 280
            counter.classList.add("number") //add number class to count 
            percentage.style = `--percent: ${percent}` //change percentage style 
            circles.forEach(circle => {
                circle.setAttribute("cx", 10) //change circle attributes (make percentage circle smaller)
                circle.setAttribute("cy", 10)
                circle.setAttribute("r", 8)
            })
            if(textLength >= 270) {
                //when post length is about to reach max
                counter.classList.remove("number") //remove number class and change color to orange (warning)
                circles.forEach(circle => {
                    circle.setAttribute("cx", 20) //expand percentage circle 
                    circle.setAttribute("cy", 20)
                    circle.setAttribute("r", 15)
                })
                h3Count.innerHTML = 280 - textLength //show remaining characters available
            }
        } else {
            postBtn.classList.add("error") //disable post btn
            //when post length exceed 280
            counter.classList.add("error") //add error class to count div
            h3Count.innerHTML = new Intl.NumberFormat().format(280 - textLength) //show exceeded characters
            if(textLength >= 290) {
                counter.classList.add("error-svg") //turn off percentage circle when exceeded characters reaches 290
            }
        }
    } else if(textLength === 0) {
        counterDiv.classList.add("count-disabled") //if no text disable counter
        postBtn.classList.add("error") //disable post btn
    }
}

/* EventListener for file input for post reply section */
uploadFiles.addEventListener("change", ()=>{
    /*WHENEVER A USER UPLOADS A FILE USING INPUT TYPE FILE CALL previewUploadFiles */
    previewUploadFiles(uploadFiles.files, uploadedFilesDiv, replyPostBtn)
})

/* A FUNCTION THAT TAKES FILE INPUT, A DIV CONTAINER TO ADD FILES IN FILE INPUT AND 
POST BTN FOR FILE INPUT SECTION
You can upload as many as 4 images and only 1 Video File */
function previewUploadFiles(file, uploadSection, postBtn){
    let max = file.length //set max at 4 (Max files accepted)
    /*IF FILES ARE LESS THAN 4 do this else do nothing */
    if(max <= 4) {
        //if files are less than 4
        let typesArray = [] //an array to hold the file types from all files from input
        for(let i = 0; i < file.length; i++) {
            //Loop through all files and add it's type to typesArray
            typesArray.push(file[i].type.split("/")[0]) //push each media type into typesArray
        }
        //check if all files selected are the same types 
        let fileChecker = checkerArray(typesArray)
        if(fileChecker) {
            //if all files are same size
            //Check if it's a Video Uploaded or Images
            if(typesArray.includes("video")) {
                //if all files are video files 
                let fileLength = file.length
                if(fileLength != 1) {
                    console.log("Error, Upload just one video")
                } else {
                    //can only accept one video file 
                    console.log("yeah")
                }
            } else if(typesArray.includes("image")) {
                //For Images call addUploadFile to add Images
                addUploadFile(file, uploadSection, postBtn)
            }
        } else console.log("You can't upload images and video") //when all files are not of the same type
    }
    
    // uploadFiles.value = null
}

/* CHECKER ARRAY IS A FUNCTION TO CHECK IF ALL FILES UPLOADED ARE OF THE SAME TYPE 
ELSE REJECT UPLOAD */
function checkerArray(array) {
    //A  function to check if all values in an array are the same
    let check = array[0] //set check to first item in array
    let checker = false
    for(let i = 0; i < array.length; i++) {
        if(check != array[i]) {
            //change checker to true whenever a mismatch happens
            checker = true;
            break;
        }
    }
    if(checker) return false 
    else return true
}

let currentMedia; //keep changes of the media files for file input

/* A Function TO Dislay Files to be Uploaded 
it takes 3 arguments fileInput, a Div to display Files and Fileinput section PostBtn 
PostBtn is automatically disabled, it's enable when a user types in a text and also when a user input a file without typing a text */
function addUploadFile(file, uploadSection, postBtn) {
    postBtn.classList.remove("error")// enable post Btn when user selects files to be uploaded
    //takes in 2 arguments(the files to be uploaded and the upload section i.e post reply section or comment pop up section)
    uploadSection.innerHTML = "" //clear all previous media files in the uploadSection
    let fileLength = file.length //get the number of files 
    uploadSection.classList.remove("two", "three", "four") //remove all these classList from the uploadSection
    switch (fileLength) {
        case 2:
            //for two files
            uploadSection.classList.add("two")
            break;
        case 3: 
            //for 3 files
            uploadSection.classList.add("three")
            break;
        case 4: 
            uploadSection.classList.add("four")
        default:
            break;
    }
    let form = new FormData() //create a form to hold all files
    //Loop through all files
    for (let i = 0; i < file.length; i++) {
        form.append("fileInput", file[i]) //Add file to formData
        //loop through files and add each media file
        let blobURL = URL.createObjectURL(file[i]) //convert it to a blob
        let type = file[i].type.split("/")[0] //Get The File Type
        if(type === "video") {
          let video = document.createElement("video")
          video.setAttribute("disablepictureinpicture", "")
          video.setAttribute("loop", "")
          video.setAttribute("autoplay", "")
          video.setAttribute("muted", "")
          let source = document.createElement("source")
          source.setAttribute("type", "video/mp4")
          source.setAttribute("src", blobURL)
          video.appendChild(source)
        } else if(type === "image") {
            let div = document.createElement("div") //div to hold media file
            div.classList.add("image-upload")
            div.setAttribute("data-i", i) //set data-i attribute to the index of the file in fileObject
            if(fileLength == 3 && i == 0) div.classList.add("one") //for 3 file input give the first file a classList of one
            let image = document.createElement("img") //create the img
            image.src = blobURL
            div.append(image)
            let span = document.createElement("span")
            span.classList.add("material-icons-outlined")
            span.classList.add("delete-img")
            span.innerHTML = "close"
            div.append(span)
            uploadSection.append(div)
        }
    }
    // else postBtn.classList.add("error") //disable post btn when all media files are deleted 
    currentMedia = form.getAll("fileInput") //Update the currentFile Variable to latests File 
    /*CHECK IF THERE ARE STILL FILES, IF FILES CALL DELETEIMAGE 
    Else disable postBtn (meaning no files to be uploaded) */
    if(file.length != 0) deleteImage(file, uploadSection, postBtn) //ADD AN EVENTLISTENER TO ALL DELETE BTN 
    else postBtn.classList.add("error") //disable post btn when all media files are deleted 
}

//An Event EventListener to listen for when a user intends to delete an Image preview to be uploaded
function deleteImage(file, uploadSection, postBtn) {
    //a function to query all delete Image Btn
    let allDeleteImgBtn = uploadSection.querySelectorAll(".image-upload .delete-img") //get all the remove img btn from all image-upload div in uploadSection
    allDeleteImgBtn.forEach(btn => {
        btn.addEventListener("click", (e)=> {
            /* GET THE IMG data-i attribute which signifies the Image number i.e 3rd Image in an array of 4 images Uploaded 
            Create a new FormData and loop through all Files Added to UploadSection and 
            append every other file except file with same data-I to the one to be deleted */
            let parentDivData = e.target.parentElement.getAttribute("data-i") //get the data-i of the parent Div. (data-i represent)
            let form = new FormData()
            for (let i = 0; i < file.length; i++) {
                if(i != parseInt(parentDivData)) {
                    form.append("fileInput", file[i])
                }
            }
            let newFile = form.getAll("fileInput") //get all the media file in an array
            /* Display Latest Available Files */
            addUploadFile(newFile, uploadSection, postBtn) //add the new files
        })
    })
}

function likeSensor(){
  /* A FUNCTION TO LISTEN FOR POST LIKES 
  -QUERY ALL LIKE BTN AND ADD CLICk EVENT LISTENER*/
  let allLikeIcon = document.querySelectorAll(".likeIcon")
  allLikeIcon.forEach(likeBtn => {
    likeBtn.addEventListener("click", likePost)
  })
}

async function likePost() {
  //A function to update the database whenever a post is liked or unliked
  let checker; //checker signifies if a post is liked(true) or unliked(false)
  //GET THE 3 PARENT OF THE LIKE BTN 
  let parentDiv = this.parentElement.parentElement.parentElement //GET THE 3 PARENT OF THE LIKE ICON 
  //Get The Likes Count Element, the Element that holds the value of likes a comment or post has
  let likeCountEl = parentDiv.querySelector(".like-count")
  /* CHECK IF POST IS LIKED BY USER 
  A POST LIKED BY USER HAS A CLASSLIST OF likeUser*/
  if(this.classList.contains("likeUser")) {
    checker = true //SET CHECKER TO TRUE TO SIGNIFY POST IS LIKED AND USER INTEND TO UNLIKE 
    this.classList.remove("likeUser") //REMOVE likeUser (MEANING UNLIKE POST)
    this.innerHTML = "favorite_border" //change Icon (change like Icon back to transparent/white)
    //set LikeCount to the value of likeCountEl and decrease by 1
    let likeCount = parseInt(likeCountEl.textContent) - 1//convert to Int
    if(likeCount == 0) likeCountEl.innerHTML = "" //IF likecount is 0, Display "" instead of 0
    else likeCountEl.innerHTML = likeCount //update nextElementSibling
  } else {
    /* WHEN POST IS LIKED*/
    checker = false //SET CHECKER TO FALSE TO SIGNIFY POST IS UNLIKED AND USER INTEND TO LIKE
    this.classList.add("likeUser") //Add likeUser (Meaning Like Post)
    this.innerHTML = "favorite" //change icon (change like Icon to Red)
    //set LikeCount to the value of likeCountEl and increase by 1
    let likeCount;
    if(likeCountEl.textContent.length == 0) {
      //IF likeCountEl textContent is null set likeCount to 0, meaning no Likes
      likeCount = 0
    } else likeCount = parseInt(likeCountEl.textContent)//convert to Int
    likeCount += 1 //increment like count 
    likeCountEl.innerHTML = likeCount
  } 
  /* GET THE PARENT ELEMENT OF LIKE ICON 
  AND CHECK IF IT"S A COMMENT OR THE MAIN POST ITSELF 
  COMMENT LIKE API ROUTE IS DIFFERENT FROM POST API ROUTE */
  /* CHECK IF PARENT DIV IS A COMMENT OR POST 
  FOR POST, PARENT DIV SHOULD CONTAIN A CLASSNAME OF POST-DIV 
  FOR COMMENT, PARENT DIV SHOULD CONTAIN A CLASSNAME OF POST
  CHECK IF IT"S A COMMENT OR THE MAIN POST ITSELF 
  COMMENT LIKE API ROUTE IS DIFFERENT FROM POST API ROUTE */
  if (parentDiv.classList.contains("post-div")) {
    //MEANING PARENT DIV IS A POST 
    let postId = parentDiv.getAttribute("id") //Get The Post Id 
    postId = postId.slice(2) //cut out the letters 'ID' from the Id attribute 
    try {
      await axios.post("/myInfo/like", {
        checker,
        postId
      })
    } catch (error) {
      console.log(error.response.data)
    }
  } else if(parentDiv.classList.contains("post")) {
    //MEANING PARENT DIV IS A COMMENT 
    let commentId = parentDiv.getAttribute("id") //Get The Comment Id 
    commentId = commentId.slice(2) //cut out the letters 'ID' from the Id attribute 
    try {
      await axios.post("/myInfo/comment", {
        checker,
        commentId
      })
    } catch (error) {
      console.log(error.response.data)
    }
  }
}

/* HANDLE COMMENT POP UP SECTION */
/* HANDLE COMMENT POP UP SECTION */
/* HANDLE COMMENT POP UP SECTION */
let pageTitle = document.querySelector("head title"); //THE PAGE TITLE TAG
let commentReply = document.querySelector(".comment-reply") //Comment POP UP Section div
let body = document.querySelector("body") //DOM body Element
let cancelReply = commentReply.querySelector(".reply-main .return-controls .return-btn") //Cancel Btn for Comment POP UP Section Div
let postBtn = commentReply.querySelector(".reply-main .return-controls .send-reply") //POST Btn to POST A COMMENT FOR COMMENT POP UP SECTION 
let uploadFilesComment = commentReply.querySelector("#reply-upload1") //Input Type Media FOR COMMENT POP UP SECTION
let kelpostComment = commentReply.querySelector(".post-actions #reply-post") //kelpost Area (Area to type text) for COMMENT POP UP SECTION
let uploadedFilesDivComment = commentReply.querySelector(".post-actions .uploads-images") //Div to Display Media Files that are selected by User For Upload FOR COMMENT POP UP SECTION
let commentPostId; //Hold The Post Id of The Post To Be Commented On
let postingLoader = document.querySelector(".post-loader") //the loading effect to show a comment is posting 
let uploadSection = document.querySelector(".upload-section") //the upload message to show a comment was made
let uploadMessage = uploadSection.querySelector(".upload-messages p") //the message to show for upload of post or comment
/*PercentCountComment is the circle that shows the percentage of Charaters Inputed into COMMENT REPLY POP UP section(The Max Chars Accepted is 280) */
let percentCountComment = commentReply.querySelector(".percent-count.count-true")
/* FRONTCOUNTDIV is a Div that Holds the PercentCount and the replyBtn for COMMENT POP UP Section */
let frontCountDivComment = commentReply.querySelector(".actions-action .front-count")
/* COUNT is the Div that holds PercentCount and the Number that represents the exact textcharacter in KelpostComment */
let countComment = frontCountDivComment.querySelector(".card") 
/* remainingText is the an Element Tag That holds the Exact TextCharacter in KelpostComment 
Mainly Used to display if a User has Exceeded the Total Character */
let remainingTextComment = countComment.querySelector(".number h3")  

/* ADD EVENT LISTENER TO KELPOSTCOMMENT TO LISTEN FOR CHANGES AND UPDATE THE COMMENT COUNT TO CHECK IF IT EXCEEDED THE MAX CHAR 280 */
kelpostComment.addEventListener("input", addTextComment) 

/* A FUNCTION TO ADD TEXT TO COMMENT POP UP SECTION*/
function addTextComment() {
  //add text to comment pop up section
  countPostArea(kelpostComment, countComment, postBtn, frontCountDivComment, percentCountComment, remainingTextComment)
}

function addEmoji1(emoji) {
  //a function to add emoji to text post
  kelpostComment.textContent += emoji //add emoji to text input
  countPostArea(kelpostComment, countComment, postBtn, frontCountDivComment, percentCountComment, remainingTextComment)
}

/* EventListener for file input for post reply section */
uploadFilesComment.addEventListener("change", ()=>{
  /*WHENEVER A USER UPLOADS A FILE USING INPUT TYPE FILE CALL previewUploadFiles */
  previewUploadFiles(uploadFilesComment.files, uploadedFilesDivComment, postBtn)
})

/* A FUNCTION TO ADD EVENTLISTENER TO ALL COMMENTS AND 
POP UP A COMMENT POP UP SECTION FOR COMMENT*/
function commentSensor() {
  //GET ALL THE COMMENT BTN
  let allCommentBtn = document.querySelectorAll(".commentBtn") //All CommentBtn
  //Loop Through and Add EventListener
  allCommentBtn.forEach(btn => {
    /* WHEN A COMMENT BTN IS CLICKED, GET THE POST INFORMATIONS 
    User's Profile Picture, Comment Author's Username, Comment Text, CommentId*/
    btn.addEventListener("click", (e)=>{
      clearPRSection();
      //CA stands for Comment Author
      let CAImage = e.target.parentElement.parentElement.parentElement.children[0].children[0].children[0].src //Get the profilePicture of the Comment Author
      let CAUsername = e.target.parentElement.parentElement.parentElement.children[0].children[1].children[0].children[0].innerHTML //get the username of the comment Author
      let commentText = e.target.parentElement.parentElement.parentElement.children[0].children[1].children[0].children[1].children[0].innerHTML //get the comment text 
      let commentId = e.target.parentElement.parentElement.parentElement.getAttribute("id").slice(2) //get the comment Id
      commentPostId = commentId //set commentPostId to commentId 
      changePostReply(CAImage, CAUsername, commentText) //UNIQUELY FIX COMMENT INFO IN COMMENT POP UP SECTION WHEN COMMENT BTN IS CLICKED
      pageTitle.innerHTML = "Compose Post Reply" //Change The Page Title to Compose Post Reply 
      body.classList.add("visible") //Add Visible to Body to prevent Body from scrolling 
      commentReply.classList.add("visible") //display comment reply section div
      postBtn.classList.add("comment") //add comment to postBtn classList to signify a comment
    })
  })
}

/* A FUNCTION TO CLEAR POP REPLY SECTION 
WHENEVER A USER CLICKS ON ANY COMMENT SECTION 
CLEAR THE POST REPLY SECTION 
THE SECTION UNDERNEATH THE MAIN POST TO REPLY/COMMENT ON THE POSP*/
function clearPRSection() {
  /* FIRST CLEAR CURRENT MEDIA, CURRENT MEDIA IS A VARIABLE TO KEEP TRACK OF FILES UPLOADED IN BOTH SECTION (POST REPLY AND COMMENT POP UP) */
  currentMedia = null;
  /* CLEAR uploadFilesDiv for postReplySection and set UploadFile for Post Reply Section To null 
  uploadedFilesDiv is the Div to preview uploaded files in Post Reply Section and uploadFile is the input type file for post reply section */
  uploadFiles.value = null;
  uploadedFilesDiv.innerHTML = "";
  /* THEN CLEAR TEXT CONTENT IN KELPOST (THE TEXT INPUT AREA IN POST REPLY SECTION) */
  kelpost.innerHTML = "";
  /* countPostArea is a Function to count Text in Kelpost to know if User has exceeded max chars */
  countPostArea(kelpost, count, replyPostBtn, frontCountDiv, percentCount, remainingText)
}

/* HANDLE POSTING FOR COMMENTS IN COMMENT POP UP SECTION 
FIRST CHECK WHEN USER CLICKS POST BTN IF POST BTN CONTAINS COMMENT (Comment signify it's a comment)
Using FormData 
-Append CommentId and caption 
then check if Comment has Media Files */
postBtn.addEventListener("click", async()=>{
  //check if postBtn is enabled and it contains comment to signify a comment 
  //POST BTN HAS A CLASSNAME OF ERROR WHEN NOTHING IS INPUTED 
  if(!postBtn.classList.contains("error") && postBtn.classList.contains("comment")) {
    let form = new FormData()
    let commentId = commentPostId //Get the commentId
    let caption = kelpostComment.textContent.trim() //Get Caption of Comment 
    form.append("caption", kelpostComment.textContent) //get the caption for the comment 
    form.append("postId", commentPostId) //get the reference post Id 
    /* CURRENT MEDIA IS AN ARRAY OF MEDIA FILES TO BE UPLOADED  
    Check is Comment Has Media Files */
    if(currentMedia) {
      //Loop through currentMedia if there is a media file 
      currentMedia.forEach(file => {
        form.append("fileInput", file) //APPEND MEDIA TO FORM 
      })
    }
    console.log(currentMedia)
    cancelReplyBar() //cancel comment||post bar, redirect to home while you upload comment
    postingLoader.classList.remove("display-off") //display loading Bar for comment upload 
    try {
      console.log(caption, currentMedia)
      //first check if the comment is a duplicate comment
      // await axios.post("/postKel/duplicate", { caption, postId }, {
      //   headers: {
      //   'Content-Type': 'multipart/form-data'
      //   }
      // })
      // /* IF Comment is not a Duplicate, upload comment */
      // let comment = await axios.post("/postKel/comment", form, {
      //   headers: {
      //   'Content-Type': 'multipart/form-data'
      //   }
      // })
      // console.log(comment)
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


/* FOR COMMENT POP UP SECTION
replyPostDesign is the Div in COMMENT POP UP SECTION that holds the Exact POST/COMMENT Authors Profile's Picture
i.e the COMMENT/POST Author's Info that shows the caption and user's info you which to comment on 
replyPostDiv is the div that holds the Exact POST/COMMENT Author's Username and Caption of the Post To Be Commented on*/
let replyPostDesign = commentReply.querySelector(".reply-main .exact-post-reply .image-design")
let replyPostDiv = commentReply.querySelector(".exact-post-reply .post-div")

//Cancel Btn For Comment POP UP Section Div
cancelReply.addEventListener("click", cancelReplyBar)

/* When Cancel Comment POP UP Section is Clicked 
Reset Comment POP UP Section*/
function cancelReplyBar() {
  //A FUNCTION TO RESET EVERYTHING IN COMMENT POP UP SECTION
  postBtn.classList.remove("comment") //remove comment from postBtn
  uploadFilesComment.value = null //remove all files in fileInput type file FOR COMMENT POP UP SECTION 
  currentMedia = null; //set current Media to null
  kelpostComment.innerHTML = "" //set text input for COMMENT POP UP SECTION to null
  countPostArea(kelpostComment, countComment, postBtn, frontCountDivComment, percentCountComment, remainingTextComment)
  uploadedFilesDivComment.innerHTML = "" //remove all media files if any in COMMENT POP UP SECTION 
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
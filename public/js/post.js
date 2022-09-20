import { zoomEffect } from "./zoomNew.js";
$(document).ready(function (){
    $("#myEmoji").emojioneArea({
        pickerPosition: "bottom"
    })
    var el = $("#myEmoji").emojioneArea();
    el[0].emojioneArea.on("emojibtn.click", function(btn, event) {
        console.log("yeah")
        addEmoji(el[0].emojioneArea.getText())
        el[0].emojioneArea.setText("")
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

let postReplyContainer = document.querySelector(".main-route-post-div .post-sub-section") //The Rely Box directly under a Post 
const postUrl = window.location.pathname.split("/") //Get the Url of the post or comment 
const postId = postUrl[postUrl.length - 1] //Get the postId from the URL
let loadingDiv = document.querySelector("#main-container .loading-div") //The Loading Effect You See When Fetching Data About Post 
let mainMainPostDiv = document.querySelector("#main-container .main-main-post") //The Main Post Div for Post Info.
let backBtn = document.querySelector(".page-header .return-btn") //The Back Btn To Go Back In Window's History 
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
    mainMainPostDiv.classList.add("loading")
    let postInfo; //hold Information about the post
    try {
        let {data} = await axios.post("/user/postInfo", {
            postId
        })
        postInfo = data
    } catch (error) {
        console.error(error.response.data)
    }
    console.log(postInfo)
    arrangePostInfo(postInfo)
    loadingDiv.classList.add("loaded")
    mainMainPostDiv.classList.remove("loading")
}

getPostInfo()

/* ARRANGE POST INFO */
function arrangePostInfo(data) {
    //A Function to arrange the data of the post Info when gotten from the API 
    let mainPostDiv = document.querySelector(".main-main-post .main-route-post-div") //The Main Div for post info 
    let postProfilePicture = mainPostDiv.querySelector(".user-info-div .user-info-profile") //User's Profile Picture 
    postProfilePicture.src = data[0].postedBy.profilePicture //set the post profile Picture from Post's Info 
    let postUsername = mainPostDiv.querySelector(".user-info-div .user-info-username") //Username 
    postUsername.innerHTML = data[0].postedBy.username //Set The Post Username 
    let postCaption = mainPostDiv.querySelector(".post-text .text-text") //post caption
    postCaption.innerHTML = data[0].caption //set post caption
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
    let postTime = mainPostDiv.querySelector(".main-post-time .time-time") //The Post Time Element 
    let postDate = mainPostDiv.querySelector(".main-post-time .date-time") //The Post Date Element 
    let APIPostTime = new Date(data[0]._createdAt)
    let APITime = localeTime(APIPostTime) //convert time to 1:50 PM and Sept 11, 2022 format 
    postTime.innerHTML = APITime.time //set POST Time to time from APiTime 
    postDate.innerHTML = APITime.date //set post Date to date from APIDate 
    let postLikesCount = mainPostDiv.querySelector(".action-counter .like-count-div .like-like") //The Post Like count 
    postLikesCount.innerHTML = data[0].likes 
    zoomEffect()
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
 
function addEmoji(emoji) {
    //a function to add emoji to text post
    let kelPost = document.querySelector("#reply-post") //text input 
    kelPost.textContent += emoji //add emoji to text input
    countPostArea(kelpost, count, replyPostBtn, frontCountDiv, percentCount, remainingText)
}

/* UPDATE TEXT COUNT TO KNOW IF A USER HAS EXCEEDED MAX CHAR ACCEPTED */
//post reply section is the reply box underneath a post while comment pop up is the reply box in a comment pop up section

/*PercentCount is the circle that shows the percentage of Charaters Inputed in to The Max Chars Accepted (280) post reply section */
let percentCount = postReplyContainer.querySelector(".percent-count.count-true")
/* KelPost is the area where a User types response or comment for a Post For Post Reply Section */
let kelpost = postReplyContainer.querySelector(".post-actions #reply-post") 
let replyPostBtn = postReplyContainer.querySelector(".actions-action .send-reply-reply") //Reply/Post btn for post Reply Section 
/* FRONTCOUNTDIV is a Div that Holds the PercentCount and the replyBtn for Post Reply Section */
let frontCountDiv = postReplyContainer.querySelector(".actions-action .front-count")
/* COUNT is the Div that holds PercentCount and the Number that represents the exact textcharacter in Kelpost */
let count = frontCountDiv.querySelector(".card") 
/* remainingText is the an Element Tag That holds the Exact TextCharacter in Kelpost 
Mainly Used to display A User has Exceeded the Total Character */
let remainingText = count.querySelector(".number h3")  
/* ADD AN EVENTLISTENER TO KELPOST  */
kelpost.addEventListener("input", addText) 
let uploadFiles = postReplyContainer.querySelector("#reply-upload") //input type file for media for post reply section 
let uploadedFilesDiv = postReplyContainer.querySelector(".post-actions .uploads-images") //div to hold all upload media for post reply section

/* A FUNCTION TO ADD TEXT TO REPLY POST SECTION*/
function addText() {
    //add text to post reply section
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
    //I made it possible for countPostArea to take 6 arguments so it can be used both for post reply section and comment reply section 

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

//EventListener for file input for post reply section
uploadFiles.addEventListener("change", ()=>{
    previewUploadFiles(uploadFiles.files, uploadedFilesDiv)
})

/* A FUNCTION THAT TAKES FILE INPUT AND A DIV CONTAINER TO ADD FILES IN FILE INPUT 
You can upload as many as 4 images and only 1 Video File */
function previewUploadFiles(file, uploadSection){
    // console.log(file)
    let max = file.length //set max at 4 (Max files accepted)
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
                addUploadFile(file, uploadSection)
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
it takes 2 arguments fileInput and a Div to display Files */
function addUploadFile(file, uploadSection) {
    //I made addUploadFile take in 2 arguments(the file and the upload section i.e post reply section or comment pop up section)
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
        form.append("fileInput", file[i])
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
    currentMedia = form.getAll("fileInput") //Update the currentFile
    deleteImage(file, uploadSection) //ADD AN EVENTLISTENER TO ALL DELETE BTN 
}

//An Event EventListener to listen for when a user intends to delete an Image preview to be uploaded
function deleteImage(file, uploadSection) {
    //a function to query all delete Image Btn
    let allDeleteImgBtn = uploadSection.querySelectorAll(".image-upload .delete-img") //get all the remove img btn from all image-upload div in uploadSection
    allDeleteImgBtn.forEach(btn => {
        btn.addEventListener("click", (e)=> {
            let parentDivData = e.target.parentElement.getAttribute("data-i") //get the data-i of the parent Div. (data-i represent)
            let form = new FormData()
            for (let i = 0; i < file.length; i++) {
                if(i != parseInt(parentDivData)) {
                    form.append("fileInput", file[i])
                }
            }
            let newFile = form.getAll("fileInput") //get all the media file in an array
            addUploadFile(newFile, uploadSection) //add the new files
        })
    })
}
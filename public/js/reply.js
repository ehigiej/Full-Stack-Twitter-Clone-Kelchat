$(document).ready(function (){
    $("#myEmoji").emojioneArea({
        pickerPosition: "bottom"
    })
    var el = $("#myEmoji").emojioneArea();
    el[0].emojioneArea.on("emojibtn.click", function(btn, event) {
        // console.log(btn.html());
        // console.log(el[0].emojioneArea.getText())
        addEmoji(el[0].emojioneArea.getText())
        el[0].emojioneArea.setText("")
        // console.log(el[0].emojioneArea.getText())
        // console.log( el[0].emojioneArea.showPicker())
    });
})

/* ADD EMOJI TO KELPOST TEXTAREA WHEN EMOJI IS CLICKED*/
function addEmoji(emoji) {
    //a function to add emoji to text post
    let kelPost = document.querySelector("#reply-post") //text input 
    kelPost.textContent += emoji //add emoji to text input
    countPostArea()
}

//update text count check
let percentCount = document.querySelector(".percent-count.count-true") //text count percentage checker
let kelpost = document.querySelector(".post-actions #reply-post") //kelpost area 
let frontCountDiv = document.querySelector(".actions-action .front-count") //front-count-div 
let count = frontCountDiv.querySelector(".card") //front-count
let remainingText = count.querySelector(".number h3") //remainingText counter
let kelpostBtn = document.querySelector(".return-controls .send-reply") //the post btn
kelpost.addEventListener("input", countPostArea)
let uploadFiles = document.querySelector("#reply-upload") //input type file for media
let uploadedFilesDiv = document.querySelector(".post-actions .uploads-images") //div to hold all upload media


export function countPostArea() {
    let textLength = kelpost.textContent.length //get the length of the post
    let circles = count.querySelectorAll("svg .percent-count")//get the circles for percentage representation
    //A function to count text in reply/post area 
    if(textLength != 0) {
        count.classList.remove("error") //remove error class from count
        count.classList.remove("error-svg") //remove error-svg class from count 
        kelpostBtn.classList.remove("error") //enable post btn
        frontCountDiv.classList.remove("count-disabled") //if text enable counter
        let percent = (textLength / 280) * 100 //get the percentage of the text (Max character accepted is 280)
        if(textLength < 280) {
            //If post is less than 280, max character for post is 280
            count.classList.add("number") //add number class to count 
            percentCount.style = `--percent: ${percent}` //change percentage style 
            circles.forEach(circle => {
                circle.setAttribute("cx", 10) //change circle attributes (make percentage circle smaller)
                circle.setAttribute("cy", 10)
                circle.setAttribute("r", 8)
            })
            if(textLength >= 270) {
                //when post length is about to reach max
                count.classList.remove("number") //remove number class and change color to orange (warning)
                circles.forEach(circle => {
                    circle.setAttribute("cx", 20) //expand percentage circle 
                    circle.setAttribute("cy", 20)
                    circle.setAttribute("r", 15)
                })
                remainingText.innerHTML = 280 - textLength //show remaining characters available
            }
        } else {
            kelpostBtn.classList.add("error") //disable post btn
            //when post length exceed 280
            count.classList.add("error") //add error class to count div
            remainingText.innerHTML = new Intl.NumberFormat().format(280 - textLength) //show exceeded characters
            if(textLength >= 290) {
                count.classList.add("error-svg") //turn off percentage circle when exceeded characters reaches 290
            }
        }
    } else if(textLength === 0) {
        frontCountDiv.classList.add("count-disabled") //if no text disable counter
        kelpostBtn.classList.add("error") //disable post btn
    }
}

uploadFiles.addEventListener("change", ()=>{
    previewUploadFiles(uploadFiles.files)
})

function previewUploadFiles(file){
    console.log(file)
    // let form = new FormData()
    // for (let i = 0; i < file.length; i++) {
    //     form.append("fileInput", file[i])
    // }
    // console.log(form.getAll("fileInput"))
    let max = file.length //set max at 4
    if(max <= 4) {
        let typesArray = [] //an array to hold different types of media in file object
        for(let i = 0; i < file.length; i++) {
            // console.log(file[i], file[i].type)
            typesArray.push(file[i].type.split("/")[0]) //push each media type into typesArray
        }
        //check if all files selected are the same types 
        let fileChecker = checkerArray(typesArray)
        if(fileChecker) {
            //if all files are same size
            if(typesArray.includes("video")) {
                let fileLength = file.length
                if(fileLength != 1) {
                    console.log("Error, Upload just one video")
                } else {
                    console.log("yeah")
                }
            } else if(typesArray.includes("image")) {
                // for(let i = 0; i < file.length; i++) {
                //     console.log(file[i])
                // }
                addUploadFile(file)
            }
        } else console.log("You can't upload images and video")
    }
    
    // uploadFiles.value = null
}

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

export let currentMedia; //keep changes of the media files for file input

function addUploadFile(file) {
    uploadedFilesDiv.innerHTML = "" //clear all previous media files
    let fileLength = file.length //get the number of files 
    uploadedFilesDiv.classList.remove("two", "three", "four") 
    switch (fileLength) {
        case 2:
            //for two files
            uploadedFilesDiv.classList.add("two")
            break;
        case 3: 
            uploadedFilesDiv.classList.add("three")
            break;
        case 4: 
            uploadedFilesDiv.classList.add("four")
        default:
            break;
    }
    let form = new FormData()
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
            if(fileLength == 3 && i == 0) div.classList.add("one")
            let image = document.createElement("img") //create the img
            image.src = blobURL
            div.append(image)
            let span = document.createElement("span")
            span.classList.add("material-icons-outlined")
            span.classList.add("delete-img")
            span.innerHTML = "close"
            div.append(span)
            uploadedFilesDiv.append(div)
        }
      }
    currentMedia = form.getAll("fileInput")
    deleteImage(file)
}

function deleteImage(file) {
    //a function to query all delete Image Btn
    let allDeleteImgBtn = document.querySelectorAll(".image-upload .delete-img") //get all the remove img btn
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
            addUploadFile(newFile)
        })
    })
}

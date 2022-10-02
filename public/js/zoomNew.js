
function zooming() {
    zoom({
    // CSS class added to the container when zoomed
    active: "zoom-active",
    // CSS class added to images when being animated
    transition: "zoom-transition",
    // Class added to images after loaded
    visible: "visible",
    // image container class
    zoom: "zoom"
    }, {
    // Used on doubleclick, doubletap and resize
    scaleDefault: 2, 
    // Used on wheel zoom
    scaleDifference: 0.5, 
    // Maximum zoom
    scaleMax: 10, 
    // Minimum zoom
    scaleMin: 1, 
    // Disable page scrolling when zooming
    scrollDisable: false,
    // This should correspond with zoom-transition transition duration
    transitionDuration: 200, 
    // Delay between clicks - used when scripts decides if user performed doubleclick or not
    doubleclickDelay: 300
})
}

let sectionImgPreview = document.querySelector(".media-preview-main") //THE SECTION TO PREVIEW IMAGES WHEN CLICKED 
let imgMediaPreview = sectionImgPreview.querySelector(".media-main-preview-main") //IMAGES PREVIEW CONTAINER 
let cancelPreview = sectionImgPreview.querySelector(".action-cancel") //CANCEL PREVIEW BTN 
let prePreviewBtn = sectionImgPreview.querySelector(".action-left-btn") //PRE PREVIEW BTN 
let nextPreviewBtn = sectionImgPreview.querySelector(".action-right-btn") //NEXT PREVIEW BTN 
zooming()

/*A FUNCTION TO HANDLE NEXT AND PRE CONTROLS FOR PREVIEW IMAGES 
FIRST REMOVE NEXT AND PRE CONTROLS 
IF USER IS ON FIRST IMAGE SHOW NEXT CONTROL AND DISABLE PRE CONROLS 
LIKEWISE IF USER IS ON LAST IMAGE, SHOW PRE CONTROL AND DISABLE NEXT CONTROLS */
function previewControls(txLevel, scrollCount) {
    prePreviewBtn.classList.add("off") //Remove Pre Control Btn 
    nextPreviewBtn.classList.add("off") //Remove Next Control Btn 
    //scrollCount means the number of images in a post e.g a post with 3 images
    //txLevel means the exact image number in a post e.g if a user is on Img 4
    if(scrollCount != 1) {
        //IF POST HAS MORE THAN ONE IMAGE 
        if((txLevel % scrollCount) != 0) {
            //check if there's an image after the current image to be displayed 
            //if not remove next Btn 
            nextPreviewBtn.classList.remove("off")
        }
        if(((txLevel * scrollCount)/ scrollCount) != 1) {
            //Check if there's an Image before the current Image to be displayed 
            //if not remove pre Btn
            prePreviewBtn.classList.remove("off")
        }
    }
}

export function zoomEffect() {
    /* GET ALL THE IMAGES IN THE FEED AND ADD A CLICK EVENT LISTENER FOR ALL IMAGES TO IDENTiFY WHAT 
    IMAGES IS CLICKED.
    AFTER THAT, FIND THE IMG MEDIA DIV(PARENT DIV) AND QUERY FOR ALL IT'S IMAGES (ALL IMAGES IN PARENT DIV)
    ADD ALL IMAGES IN THE PARENT DIV DYNAMICALLY IN SECTION MEDIA PREVIEW AND POP UP IMAGES FOR PREVIEW */
    let mediaImgs = document.querySelectorAll(".post-div .media img"); //All Images in Feed 
    //Add an Event Listerner to all Media Containers to identify when a container is click and which container was clicked
    let currentTxLevel; //identify what IMG exactly is currently in View e.g A post with 3 Images and a user clicks on the 2nd Image 
    let scrollCountLimit; //Get The Number of Images in Post 
    //Loop through all Images and Add Click EventListener for all 
    mediaImgs.forEach(media => {
        media.addEventListener("click", (e)=>{
            let imgParentDiv = e.target.parentElement //Img Parent Div
            let parentImages = imgParentDiv.querySelectorAll("img") //Get All The Images in parent Div 
            scrollCountLimit = parentImages.length //set scrollCountLimit to Number of Images in a Post 
            currentTxLevel = parseInt(e.target.getAttribute("data-id")) //Set The Current Image in View 
            imgMediaPreview.style = `transform: translateX(-${(currentTxLevel - 1) * 100}%)` //Translate to the currentImage In View
            imgSecPreview(parentImages) //Preview The Images in SECTION MEDIA PREVIEW 
            sectionImgPreview.classList.add("show-div") //Display Section Media Preview 
            zooming() //Enable Zooming Effect
            previewControls(currentTxLevel, scrollCountLimit) //Handle the pre and next controls visibility
        })
    })
    /*ADD AN EVENT LISTENER TO PRE BTN 
    First, get the current image in Preview and total images in Div i.e currentTxLevel and scrollCountLimit
    Translate Section Media Preview Main to particular Image
    update Next and pre controls*/
    prePreviewBtn.addEventListener("click", (e)=>{
        let level = currentTxLevel //Current Image in preview 
        let txLevel = (level * 100) - 200
        currentTxLevel -= 1 //set currentImage in Preview to -1
        imgMediaPreview.style = `transform: translateX(-${txLevel}%)` //Style currentImage in preview 
        previewControls(currentTxLevel, scrollCountLimit) //Handle the pre and next controls visibility
    })
    /*ADD AN EVENT LISTENER TO NEXT BTN 
    First, get the current image in Preview and total images in Div i.e currentTxLevel and scrollCountLimit
    Translate Section Media Preview Main to particular Image
    update Next and pre controls*/
    nextPreviewBtn.addEventListener("click", ()=>{
        // console.log(currentTxLevel, scrollCountLimit)
        let level = currentTxLevel; //Current Image in preview 
        imgMediaPreview.style = `transform: translateX(-${level * 100}%)` //Style
        currentTxLevel += 1
        previewControls(currentTxLevel, scrollCountLimit) //Handle the pre and next controls visibility
    })
    /*DETERMINE WHEN A USER SWIPE LEFT AND RIGHT WHEN PREVIEWING IMAGES*/
    /*DETERMINE WHEN A USER SWIPE LEFT AND RIGHT WHEN PREVIEWING IMAGES*/
    /*DETERMINE WHEN A USER SWIPE LEFT AND RIGHT WHEN PREVIEWING IMAGES*/
    imgMediaPreview.addEventListener('swiped-left', function(e) {
        /* A PREVIEW IMAGE IS INSIDE A DIV CALLED ZOOM 
        WHEN IMG IS ZOOMED, IT'S PARENT DIV(ZOOM) GET A CLASS NAME OF ZOOM-ACTIVE*/
        // console.log(e.target); // the element that was swiped
        //WHEN SWIPED LEFT 
        let targetElement = e.target //Get the target (a sensor for where was touched on the screen either the IMG or It's Div)
        let targetType = targetElement.tagName.toLowerCase() //Get the targetElement Tag Type e.g IMG or DIV
        let parentDiv; //ParentDiv to hold the targetElement parentDiv 
        if(targetType == "img") {
            //If targetElement is an Image i.e The Img itself
            parentDiv = e.target.parentElement //Set ParentDiv to it's ParentElement i.e the Parent is a Div with classname ZOOM 
        } else if (targetType == "div") parentDiv = e.target //If targetType is a Div, if Zoom Div itself was clicked  
        //CHECK IF CURRENT IMAGE HAS A ZOOM-ACTIVE (which signifies active zooming)
        if(!parentDiv.classList.contains("zoom-active")) {
            //If Not zoom-active, scroll left
            if(currentTxLevel != scrollCountLimit) {
                let level = currentTxLevel; //Set Level to currentTxLevel
                imgMediaPreview.style = `transform: translateX(-${level * 100}%)`
                currentTxLevel += 1
                previewControls(currentTxLevel, scrollCountLimit)
            }
        }
    });
    imgMediaPreview.addEventListener('swiped-right', function(e) {
        /* A PREVIEW IMAGE IS INSIDE A DIV CALLED ZOOM 
        WHEN IMG IS ZOOMED, IT'S PARENT DIV(ZOOM) GET A CLASS NAME OF ZOOM-ACTIVE*/
        // console.log(e.target); // the element that was swiped
        //WHEN SWIPED RIGHT
        let targetElement = e.target //Get the target (a sensor for where was touched on the screen either the IMG or It's Div)
        let targetType = targetElement.tagName.toLowerCase()  //Get the targetElement Tag Type e.g IMG or DIV
        let parentDiv; //ParentDiv to hold the targetElement parentDiv 
        if(targetType == "img") {
            parentDiv = e.target.parentElement //Set ParentDiv to it's ParentElement 
        } else if (targetType == "div") parentDiv = e.target
        if(!parentDiv.classList.contains("zoom-active")) {
            if(currentTxLevel != 1) {
                let level = currentTxLevel
                let txLevel = (level * 100) - 200
                currentTxLevel -= 1
                imgMediaPreview.style = `transform: translateX(-${txLevel}%)`
                previewControls(currentTxLevel, scrollCountLimit)
            }
        }
    });
}


/*A FUNCTION THAT TAKES AN ARRAY OF IMAGES AND PREVIEW THEM FOR THE USER */
//Preview Images in Section Img Preview
function imgSecPreview(imgArray) {
    let sectionImages = "" //Set an Empty String to hold the HTML for ImgMediaPreview
    /*Loop through all the Images and append each image sectionImages string in a particular manner*/
    imgArray.forEach((img, index) => {
        sectionImages += `
        <div class="media-preview-container">
            <div class="zoom">
                <img src="${img.getAttribute("src")}" alt="image" image-count="${index + 1}">
            </div>
        </div>` 
    })
    imgMediaPreview.innerHTML = sectionImages //set imgMediaPreview innerHTML to sectionImages string 
}
/*A FUNCTION TO CANCEL MEDIA PREVIEW SECTION  
FIRST, cancel sectionImgPreview*/
cancelPreview.addEventListener("click", function(){
    sectionImgPreview.classList.remove("show-div") //Cancel SectionImgPreview 
    imgMediaPreview.style = `transform: translateX(${0}%)` //Reset style for imgMediaPreview
    imgMediaPreview.innerHTML = "" //Reset ImgMediaPreview Div
})

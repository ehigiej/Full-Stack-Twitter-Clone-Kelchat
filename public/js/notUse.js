    // let postDiv = document.createElement("div") //create a postDiv as ParentDiv for post details
    // postDiv.classList.add("post")
    // postDiv.setAttribute("id", `id${post._id}`) //set id to post ID in the database
    // let postSub = document.createElement("div") //Sub Post Div for Post Info 
    // postSub.classList.add("postSub")
    // // postSub.href = `/user/${post.userInfo.username}/${post._id}` //set link to /username/postId
    // postDiv.appendChild(postSub) //append postSub to postDiv 
    // let profileImgDiv = document.createElement("a") //Post Route in Img Div 
    // profileImgDiv.href = `/user/${post.userInfo.username}/${post._id}` //set link to /username/postId
    // postSub.appendChild(profileImgDiv)
    // let profilePicture = document.createElement("img") //create profile Image Tag
    // profilePicture.src = post.userInfo.profilePicture //src for profile Image 
    // profilePicture.alt = post.caption.slice(0, 10) //Set the alt of the Image to first 10Characters of Post Caption 
    // profilePicture.classList.add("profile-picture")
    // profileImgDiv.appendChild(profilePicture)   //append profile picture to postDiv
    // let postDivDiv = document.createElement("div") //Div to hold username, caption and post media 
    // postDivDiv.classList.add("post-div")
    // postSub.appendChild(postDivDiv) //append postDivDiv to postDiv 
    // let postSub1 = document.createElement("a") //A Div To Hold Username and Caption
    // postSub1.href = `/user/${post.userInfo.username}/${post._id}` //set link to /username/postId 
    // postDivDiv.appendChild(postSub1) //Append PostSub1 to PostDivDiv
    // let username =  document.createElement("span") //create Username Tag 
    // username.classList.add("username") 
    // username.innerHTML = post.userInfo.username //Set Username 
    // postSub1.appendChild(username) //append username tag to postDivDiv 
    // let postTextDiv = document.createElement("div") //PostText Div 
    // postTextDiv.classList.add("post-text")
    // postSub1.appendChild(postTextDiv) //append PostTextDiv to postDivDiv
    // let textContent = document.createElement("p") //Post Caption Tag 
    // textContent.classList.add("text-text")
    // textContent.innerHTML = post.caption 
    // postTextDiv.appendChild(textContent) //append textContent to postTextDiv 
    // let mediaLength = post.media.length //get the length of media the post has
    // if(mediaLength != 0) {
    //   //If Post has Media
    //   let mediaDiv = document.createElement("div"); //create Media Div
    //   mediaDiv.setAttribute("id", `media${post._id}`); //set MediaDiv ID to post Id in the database
    //   mediaDiv.classList.add("media");
    //   //Styles depending on the Media length of the post
    //   if(mediaLength == 1) {
    //     mediaDiv.innerHTML = `
    //       <img src="${post.media[0]}" alt="picture" class="media-media" data-id="1">
    //     `
    //   } else if(mediaLength == 2) {
    //     mediaDiv.classList.add("two")
    //     mediaDiv.innerHTML = `
    //       <img src="${post.media[0]}" alt="picture" class="media-media" data-id="1">
    //       <img src="${post.media[1]}" alt="picture" class="media-media" data-id="2">
    //     `
    //   } else if(mediaLength == 3) {
    //     mediaDiv.classList.add("three")
    //     mediaDiv.innerHTML = `
    //       <img src="${post.media[0]}" alt="picture" class="media-media" data-id="1">
    //       <img src="${post.media[1]}" alt="picture" class="media-media one" data-id="2">
    //       <img src="${post.media[2]}" alt="picture" class="media-media one" data-id="3">
    //     `
    //   } else if(mediaLength == 4) {
    //     mediaDiv.classList.add("four")
    //     mediaDiv.innerHTML = `
    //       <img src="${post.media[0]}" alt="picture" class="media-media" data-id="1">
    //       <img src="${post.media[1]}" alt="picture" class="media-media" data-id="2">
    //       <img src="${post.media[2]}" alt="picture" class="media-media" data-id="3">
    //       <img src="${post.media[3]}" alt="picture" class="media-media" data-id="4">
    //       `
    //   }
    //   postDivDiv.appendChild(mediaDiv) //append MediaDiv to postDivDiv
    // }
    // let postActionDiv = document.createElement("div") //post Action Div for like, comment and share
    // postActionDiv.classList.add("post-actions")
    // postDiv.appendChild(postActionDiv) //Append PostActionDiv to PostDiv
    // let commentDiv = document.createElement("div") //comment Div
    // commentDiv.classList.add("comment")
    // postActionDiv.appendChild(commentDiv) //append commentDiv to postActionDiv
    // let commentCount //The Number of comment the post has
    // /*Check if post has a comment or it's undefined */
    // if(post.postComment != undefined && post.postComment.length != 0) {
    //   commentCount = post.postComment.length //count the comment
    // } else {
    //   commentCount = ""
    // }
    // commentDiv.innerHTML = ` 
    // <span class="material-icons-outlined commentBtn">
    //   reply
    // </span>
    // <span class="comment-count count">${commentCount}</span>`
    // let likeDiv = document.createElement("div") //like div
    // likeDiv.classList.add("like")
    // postActionDiv.appendChild(likeDiv) //append likeDiv to postActionDiv
    // let postLikes;
    // /*Check if post has likes or it's undefined */
    // if(post.likes != undefined && post.likes.length != 0) {
    //   //set postLikes to number of likes the post has
    //   postLikes = post.likes.length
    //   //check if user liked the post
    //   if(post.likedByUser != undefined) {
    //     likeDiv.innerHTML = `
    //     <span class="material-icons-outlined likeIcon likeUser">
    //       favorite
    //     </span>
    //     <span class="like-count count">${postLikes}</span>
    //     `
    //   } else {
    //     likeDiv.innerHTML = `
    //     <span class="material-icons-outlined likeIcon">
    //       favorite_border
    //     </span>
    //     <span class="like-count count">${postLikes}</span>
    //     `
    //   }
    // } else {
    //   postLikes = ""
    //   likeDiv.innerHTML = `
    //   <span class="material-icons-outlined likeIcon">
    //     favorite_border
    //   </span>
    //   <span class="like-count count">${postLikes}</span>
    //   `
    // }
    // let shareDiv = document.createElement("div")
    // shareDiv.classList.add("share")
    // postActionDiv.appendChild(shareDiv) //append shareDiv to postActionDiv
    // shareDiv.innerHTML = `
    // <span class="material-icons-outlined">
    //   share
    // </span>
    // `
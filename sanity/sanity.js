const path = require("path")
const fs = require("fs")

const sanityClient = require('@sanity/client')
const client = sanityClient({
  projectId: 'stmxuyam',
  dataset: 'production',
  apiVersion: '2021-03-25', // use current UTC date - see "specifying API version"!
  token: process.env.SANITY_TOKEN, // or leave blank for unauthenticated usage
  useCdn: true, // `false` if you want to ensure fresh data
})

// const doc = {
//   _type: "post",
//   caption: "Hello I'm Happy To Annouce I am",
//   postedBy: {
//     _ref: "55640272-3496-477a-a9d7-31f8ef8f84f4" ,
//     _type: "postedBy"
//   }
// }

function createComment() {
  let commentId;
  let respond;
  client.create({
    _type: "comment",
    caption: "real madrid is simply the best team in the world",
    postedBy: {
      _ref: "bf9fd5be-5c1b-4024-b050-d4b79193c60c",
      _type: "postedBy"
    },
    post: {
      _ref: "2a4612fa-bfe9-4d60-bbda-7da8549a6fdb",
      _type: "reference"
    }
  }).then(res => {
    console.log(res._id)
    commentId = res._id
    console.log(res)
    respond = res
  })

  client.patch("2a4612fa-bfe9-4d60-bbda-7da8549a6fdb").setIfMissing({postComment: []}).append("postComment", [respond])
  .commit({autoGenerateArrayKeys: true})
}

// createComment()
// client.patch("2a4612fa-bfe9-4d60-bbda-7da8549a6fdb").setIfMissing({postComment: []}).append("postComment", [{_ref: "uXabiSfzymOzjuQtaNZHzQ"}])
// .commit({autoGenerateArrayKeys: true})

// client.getDocument("55640272-3496-477a-a9d7-31f8ef8f84f4").then(user => console.log(user))
// let query = '*[_type == "post" && postedBy._ref == "55640272-3496-477a-a9d7-31f8ef8f84f4"] | order(time desc)'
// client.fetch(query).then(post => console.log(post))


module.exports = client














async function upload() {
  let filePath = "C:/Users/Jesse/Documents/Projects/social 3/public/KELBIS.png"
  let filePath1 = await client.assets.upload("image", fs.createReadStream(filePath), {
  filename: path.basename(filePath)
  })
  // .then(imageAsset => {
  //   return client.patch('kX7QUl10SvDnojH10tcEeu').set({profilePicture: {
  //     _type: 'image',
  //     asset: {
  //         _type: "reference",
  //         _ref: imageAsset._id
  //     }
  // }}).commit()
  // }).then(() => {
  //   console.log("Done!");
  // })
  // console.log(filePath1)
  client.patch('kX7QUl10SvDnojH10tcEeu').set({profilePicture: {
        _type: 'image',
        asset: {
            _type: "reference",
            _ref: filePath1._id
        }
    }}).commit().then(() => {
        console.log("Done!");
      })
}

// upload()


require("dotenv").config()
require("express-async-errors")
const express = require("express") 
const http = require("http")
const app = express()
const server = http.createServer(app)
const cookieParser = require('cookie-parser')
const socketio = require("socket.io")
const io = socketio(server)
const multer = require("multer")
const aws = require("aws-sdk")
const helmet = require("helmet")
const cors = require("cors")
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require("multer-s3")
let s3 = new S3Client({
    region: process.env.REGION,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.ACCESS_SECRET,
    },
    sslEnabled: false,
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
  });

//s3 configuration
aws.config.update({
    secretAccessKey: process.env.ACCESS_SECRET,
    accessKeyId: process.env.ACCESS_KEY,
    region: process.env.REGION
})

const bigS3 = new aws.S3({
    //configure Aws
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    bucket: process.env.BUCKET
})

//use Public
app.use(express.static("./public"))
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//Set Up Ejs and EJS layout
app.set("view engine", "ejs")
let expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set("layout", "layouts/layout")
app.set("layout extractScripts", true)
app.use(cookieParser())

//Helmet configuration
app.use(helmet())
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", 
            "https://accounts.google.com/gsi/client", "https://apis.google.com", "https://cdn.skypack.dev/", 
            "https://vjs.zencdn.net","https://code.jquery.com", "https://cdn.jsdelivr.net", "blob:", "https://cdn.rawgit.com/"],
            objectSrc: ["'none'"],
            imgSrc: ["'self'", "blob:", "https://kelbis.mo.cloudinary.net", "data:", "https://cdn.jsdelivr.net"],
            mediaSrc: ["'self'", "blob:", "https://kelbis.mo.cloudinary.net"],
            frameSrc: ["https://accounts.google.com"],
            connectSrc: ["https://accounts.google.com/gsi/", "http://localhost:3000", "ws://localhost:3000/socket.io/", "https://cdnma.cdnservice.space"],
            // styleSrc: ["'self'", "https://accounts.google.com/gsi/style"],
            upgradeInsecureRequests: [],
        }
    }),
    helmet.crossOriginEmbedderPolicy({ policy: "credentialless" })
)
app.use(cors())
//Packages configuration

//Multer configuration
const upload = multer({
    storage: multerS3({
        bucket: process.env.BUCKET,
        s3: s3,
        acl: "public-read",
        key: (req, file, cb) => {
            cb(null, file.originalname)
        }
    }),
    
})

const PORT = process.env.PORT || 3000

//REDIS_CLIENT 
const redisClient = require("./redis/redis") //CONNECT TO REDIS
async function connectRedis() {
    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    await redisClient.connect()
}
connectRedis()

//homepage
const homepage = require("./router/home")

//ROUTES 
//Register and Login Route
const register = require("./router/auth") //register route
const login = require("./router/login") //login route 

//UserInfo 
//Send User's info to the frontend
const userInfo = require("./router/userInfo")

//Comment 
//Handle post and delete of comment
const comment = require("./router/comment")

//PostInfo 
//Show info about a post via post route 
const post = require("./router/post")

app.use("/", homepage)
app.get("/compose", (req, res)=>{
    res.render("compose")
})

app.use("/auth/register", upload.single("fileInput"), register)

app.use("/auth/login", login)

//Delete Image/Videos From S3 Bucket
app.delete("/api/:filename", async(req, res)=> {
    const filename = req.params.filename
    //Delete Previous File from S3 Bucket
    await bigS3.deleteObject({Bucket: process.env.BUCKET, Key: filename}).promise()
    res.status(200).send("deleted")
})

//send user's info to frontend 
app.use("/myInfo", userInfo)

app.use("/postKel", upload.array("fileInput"), comment)

const axios = require("axios")

app.get("/photos", async(req, res) => {
    const albumId = req.query.albumId
    let photos = await redisClient.get(`photos?albumId=${albumId}`)
    if(photos != null) {
        return res.json(JSON.parse(photos))
    } else {
        const {data} = await axios.get(
            "https://jsonplaceholder.typicode.com/photos",
            { params : {albumId}}
        )
        redisClient.setEx(`photos?albumId=${albumId}`, DEFAULT_EXPIRATION, JSON.stringify(data))
        res.json(data)
    }
})

app.get("/photos/:id", async(req, res)=>{
    const {data} = await axios.get(
        `https://jsonplaceholder.typicode.com/photos/${req.params.id}`
    )
    res.json(data)
})

//Show info about a post via post route
app.use("/user", post)

io.on("connection", socket => {
    socket.emit("Message", "Welcome to Kel")
    socket.on("Login", ({username, followers})=> {
        // console.log(username, followers)
        followers.push(username)
        const rooms = [...followers]
        // console.log(rooms)
        socket.join(rooms)

        socket.on("post", (msg) => {
            console.log(username)
            io.to(username).emit("Message", msg)
        })
    })
})

app.use(async(err, req, res, next) => {
    console.log(err.message)
    switch (err.message) {
        case "An account exists with this username, Please enter a different username":
            return res.status(500).send("Username already exists")
            break
        case "An Acoount exists with this email, Please enter a different email":
            return res.status(500).send("An account with email already exists")
            break
        case "Username or Email is incorrect":
            return res.status(500).send("Username or Email is incorrect")
            break
        case "Incorrect Password": 
            return res.status(500).send("Incorrect Password")
            break
        case "Comment duplicate":
            return res.status(500).send("Comment duplicate")
            break
        default:
            res.status(500).send(err)
            next(err)
    }
    // if(err.message == "An account exists with this username, Please enter a different username") {
    //     return res.status(500).send("Username already exists")
    // }
    // if(err.message == "An Acoount exists with this email, Please enter a different email")
    // res.status(500).send(err)
    // next(err)
})

server.listen(PORT, ()=> {
    console.log(`Server is listening on ${PORT}`)
})


const redis = require("redis")
const redisClient = redis.createClient({
    socket : {
        port : process.env.REDIS_PORT,
        host : process.env.REDIS_URL
    },
    password: process.env.REDIS_PASSWORD
})
module.exports = redisClient;
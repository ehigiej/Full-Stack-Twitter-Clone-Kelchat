export default {
    name: "post",
    title: "Posts",
    type: "document",
    fields: [
        {
            name: "caption",
            title: "Caption",
            type: "text"
        }, 
        {
            name: "media",
            title: "Media URL",
            type: "array",
            of: [{type: "url"}]
        },
        {
            name: "time",
            title: "Posted Time",
            type: "datetime"
        },
        {
            name: "postedBy",
            title: "Posted By",
            type: "postedBy"
        },
        {
            name: "likes",
            title: "Post Likes",
            type: "like"
        },
        {
           name: "postComment",
           title: "Post Comments",
           type: "array",
           of: [
            {
                name: "comment",
                title: "Comment",
                type: "reference",
                to: [{type: "comment"}]
            }
           ]
        }
    ]
}
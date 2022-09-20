export default {
    name: "comment",
    title: "Comment",
    type: "document",
    fields: [
        {
            name: "caption",
            title: "Caption",
            type: "string"
        },
        {
            name: "media",
            title: "Media URL",
            type: "array",
            of: [{type: "url"}]
        },
        {
            name: "postedBy",
            title: "Posted By",
            type: "postedBy"
        },
        {
            name: "dateTime",
            title: "comment Time",
            type: "datetime"
        },
        {
            name: "post",
            title: "Post",
            type: "reference",
            to: [{type: "post"}]
        },
        {
            name: "replies",
            title: "Comment Replies",
            type: "array",
            of: [
                {
                    name: "refPoint",
                    title: "Reference Comment",
                    type: "reference",
                    to: [{type: "comment"}]
                }
            ]
        }
    ]
}
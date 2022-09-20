export default {
    name: 'like',
    title: "Likes",
    type: "array",
    of: [
        {
            type: "reference",
            to: [{type: 'user'}]
        }
    ],
    validation: Rule => Rule.unique()
}
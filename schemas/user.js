export default {
    name: "user",
    title: "Users",
    type: "document",
    fields: [
        {
            name: "username",
            title: "Username",
            type: "string",
            validation: Rule => Rule.required()
        },
        {
            name: "profilePicture",
            title: "Profile Picture Url",
            type: 'url',
            validation: Rule => Rule.required()
        },
        {
            name: "firstName",
            title: "First Name",
            type: "string"
        },
        {
            name: "lastName",
            title: "Last Name",
            type: "string"
        },
        {
            name: "password",
            title: "Password",
            type: "string"
        },
        {
            name: "email",
            title: "Email",
            type: "string"
        },
        {
            name: "followers",
            title: "Followers",
            type: "array",
            of: [
                {
                    type: "reference",
                    to: [{type: "user"}]
                }
            ]
        },
        {
            name: "following",
            title: "Following",
            type: "array",
            of: [
                {
                    type: "reference",
                    to: [{type: "user"}]
                }
            ]
        }
    ]
}
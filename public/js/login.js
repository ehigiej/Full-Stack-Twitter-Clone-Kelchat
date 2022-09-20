const loginForm = document.querySelector('#login-form') //Login form
const usernameEmail = document.querySelector('#usernameEmail') //username or email
const password = document.querySelector("#userPassword") //user Password 

loginForm.addEventListener("submit", async(e) => {
    e.preventDefault()
    try {
        let {data} = await axios.post("/auth/login", {
            usernameEmail: usernameEmail.value, 
            password: password.value
        })
        console.log(data)
    } catch (error) {
        console.log(error.response.data)
    }
})
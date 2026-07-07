const loginBtn =
    document.getElementById("loginBtn");

loginBtn.addEventListener("click", login);

async function login() {

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    if (!email || !password) {

        alert("Please enter email and password");

        return;
    }

    try {

        const response = await fetch(
            "http://localhost:5002/api/auth/login",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const data =
            await response.json();

        if (!response.ok) {

            alert(data.message);

            return;
        }

        localStorage.setItem(
            "token",
            data.token
        );

        alert("Login Successful");

        window.location.href =
        "create-profile.html";

    } catch (error) {

        console.log(error);

        alert("Server Error");
    }
}
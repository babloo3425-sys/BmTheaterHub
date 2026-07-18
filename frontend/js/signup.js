const signupBtn =
    document.getElementById("signupBtn");

signupBtn.addEventListener("click", signup);

async function signup() {

    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    if (!name || !email || !password) {

        alert("Please fill all fields");

        return;
    }

    try {

        const response = await fetch(
         `${API_BASE_URL}/api/auth/signup`,
       
         {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            alert(data.message);

            return;
        }

        localStorage.setItem(
            "token",
            data.token
        );

        alert("Account Created Successfully");

        window.location.href =
        "create-profile.html";

    } catch (error) {

        console.log(error);

        alert("Server Error");
    }
}
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

        /*
        =========================================
        IMPORTANT
        =========================================

        Signup no longer returns a login token.

        User must verify the email first.
        Therefore we do NOT save a token
        and we do NOT open create-profile.html.
        =========================================
        */

        alert(
            "Account created successfully.\n\n" +
            "Please check your email and click the " +
            "verification link to verify your account."
        );

    } catch (error) {

        console.log("Signup Error:", error);

        alert("Server Error");
    }
}
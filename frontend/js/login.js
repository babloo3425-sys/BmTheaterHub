const loginBtn =
    document.getElementById("loginBtn");

loginBtn.addEventListener("click", login);

async function login() {

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    if (!email || !password) {

        alert("Please enter email and password");

        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/auth/login`,
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

            alert(
                data.message ||
                "Login failed."
            );

            return;
        }

        if (!data.token) {

            alert(
                "Login failed. Authentication token not received."
            );

            return;
        }

        localStorage.setItem(
            "token",
            data.token
        );

        /*
        =====================================================
        Read role from JWT only for frontend page routing.

        Backend authentication/authorization remains the
        actual security layer.
        =====================================================
        */

        let role = "user";

        try {

            const payload =
                JSON.parse(
                    atob(
                        data.token
                            .split(".")[1]
                            .replace(/-/g, "+")
                            .replace(/_/g, "/")
                    )
                );

            role = payload.role || "user";

        } catch (tokenError) {

            console.error(
                "Token Decode Error:",
                tokenError
            );

            role = "user";
        }

        alert("Login Successful");

        if (role === "admin") {

            window.location.href =
                "admin.html";

        } else {

            window.location.href =
                "create-profile.html";
        }

    } catch (error) {

        console.error(
            "Login Error:",
            error
        );

        alert("Server Error");
    }
}
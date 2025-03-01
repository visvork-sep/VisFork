import { AUTH_URL } from "@Utils/Constants";

function redirectLogin() {
    setTimeout(() => { // timeout for safari behavior
        window.location.href = AUTH_URL + "/auth/github";
    }, 250);
}

export {
    redirectLogin,
};

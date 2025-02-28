import createClient from "openapi-fetch";
import { useFetchAvatarUrl } from "../queries/queries";
import { paths } from "@generated/auth-schema";
const AUTH_URL = import.meta.env.VITE_AUTH_URL;

const fetchClient = createClient<paths>({
    baseUrl: AUTH_URL
});

function useAvatarUrl() {
    const { data } = useFetchAvatarUrl({});
    if (data) {
        return data.viewer.avatarUrl as string;
    }
}

function redirectLogin() {
    setTimeout(() => {
        window.location.href = AUTH_URL + "/auth/github";
    }, 250);
}

export {
    redirectLogin,
    useAvatarUrl,
    fetchClient as AuthFetchClient
};
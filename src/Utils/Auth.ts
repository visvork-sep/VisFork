import createClient from "openapi-fetch";
import { useFetchAvatarUrl } from "../queries/queries";
import { paths } from "@generated/auth-schema";
import { useQuery } from "@tanstack/react-query";
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
    setTimeout(() => { // timeout for safari behavior
        window.location.href = AUTH_URL + "/auth/github";
    }, 250);
}


function useExchangeAccessToken(parameters: paths["/auth/github/token"]["get"]["parameters"]) {
    return useQuery({
        queryKey: ["Login"],
        queryFn: async () => {
            return fetchClient.GET("/auth/github/token", {
                params: parameters
            });
        },
        gcTime: 0
    });
}

export {
    redirectLogin,
    useAvatarUrl,
    useExchangeAccessToken
};


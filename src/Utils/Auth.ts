import createClient from "openapi-fetch";
import { useFetchAvatarUrl } from "../queries/queries";
import { paths } from "@generated/auth-schema";
import { useQuery } from "@tanstack/react-query";
import { AUTH_URL } from "@Utils/Constants";

const fetchClient = createClient<paths>({
    baseUrl: AUTH_URL
});

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
    useExchangeAccessToken
};


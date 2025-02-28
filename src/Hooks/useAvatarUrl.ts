import { useFetchAvatarUrl } from "../queries/queries";

/**
 * 
 * @returns avatar url if retrievable undefined otherwise
 */
function useAvatarUrl() {
    const { data } = useFetchAvatarUrl({});
    if (data) {
        return data.viewer.avatarUrl as string;
    }
}

export {
    useAvatarUrl
};

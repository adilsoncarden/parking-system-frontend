import apiService from "./api";

const BASE = "/api/roles";

export const rolService = {
    getAll: async () => {
        const res = await apiService.get(BASE);
        return res.data || [];
    },
};

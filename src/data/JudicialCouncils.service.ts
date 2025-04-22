import axiosInstance from "@/config/axios";
import { judicialCouncilInput } from "@/lib/types";

const endpoint = '/litigations';

// export const getJudicialCouncils = async (case_id: string) => {
//     const response = await axiosInstance.get(`${endpoint}/${case_id}`);
//     return response.data;
// };




export const createJudicialCouncil = async (judicialCouncil: judicialCouncilInput) => {
    const response = await axiosInstance.post(endpoint, judicialCouncil);
    return response.data;
};

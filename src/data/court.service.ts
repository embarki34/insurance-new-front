import axiosInstance from "@/config/axios";
import { courtInput } from "@/lib/types";


const endpoint = '/litigations';


export const createCourt = async (court: courtInput) => {
    const response = await axiosInstance.post(endpoint, court);
    return response.data;
};


export const updateCourt = async (court: Partial<courtInput>, id: string) => {
    const response = await axiosInstance.put(`${endpoint}/${id}`, court);
    return response.data;
};




import axiosInstance from "@/config/axios";
import { garantiesInput } from "@/lib/input-Types";
import { garantiesOutput } from "@/lib/output-Types";





const endpionts = "/garenties"

const batchEndpionts = "/garenties/createmany"




export const batchCreateGaranties = async (garanties: garantiesInput[]) => {
    const response = await axiosInstance.post(batchEndpionts, garanties);
    return response.data;
}



export const getGaranties = async (): Promise<garantiesOutput[]> => {
    const response = await axiosInstance.get(endpionts);
    return response.data;
}


export const createGarantie = async (garantie: garantiesInput) => {
    const response = await axiosInstance.post(endpionts, garantie);
    return response.data;
}


export const updateGarantie = async (garantie: Partial<garantiesInput>, id: string) => {
    const response = await axiosInstance.put(`${endpionts}/${id}`, garantie);
    return response.data;
}


export const deleteGarantie = async (id: string) => {
    const response = await axiosInstance.delete(`${endpionts}/${id}`);
    return response.data;
}







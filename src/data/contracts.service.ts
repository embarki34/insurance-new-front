import axiosInstance from "@/config/axios";
import { contractInput } from "@/lib/input-Types";
import {  contractOutput } from "@/lib/output-Types";


const endpoint = "/contracts";


export const getContracts = async (): Promise<{ contracts: contractOutput[] }> => {
    const response = await axiosInstance.get(endpoint);

    return { contracts: response.data };
}


export const createContract = async (contract: contractInput) => {
    const response = await axiosInstance.post(endpoint, contract);
    return response.data;
}


export const updateContract = async (contract: Partial<contractInput>, id: string) => {
    const response = await axiosInstance.put(`${endpoint}/${id}`, contract);
    return response.data;
}


export const deleteContract = async (id: string) => {
    const response = await axiosInstance.delete(`${endpoint}/${id}`);
    return response.data;
}


export const getContractById = async (id: string): Promise<contractOutput> => {
    const response = await axiosInstance.get(`${endpoint}/${id}`);
    return response.data;
}




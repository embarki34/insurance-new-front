import axiosInstance from "@/config/axios";
import {  ZoneOutput, ZoneDetailsOutput } from "@/lib/output-Types";
import { ZoneInput } from "@/lib/input-Types";

const endpoint = "/zones";





export const getZones = async (): Promise<ZoneOutput[]> => {
    const response = await axiosInstance.get(endpoint);
    return response.data;
}


export const createZone = async (zone: ZoneInput): Promise<ZoneOutput> => {
    const response = await axiosInstance.post(endpoint, zone);
    return response.data;
}


export const updateZone = async (zone: Partial<ZoneOutput>): Promise<ZoneOutput> => {
    const response = await axiosInstance.put(`${endpoint}/${zone.id}`, zone);
    return response.data;
}


export const deleteZone = async (id: string): Promise<void> => {
    await axiosInstance.delete(`${endpoint}/${id}`);
}


export const getZoneById = async (id: string): Promise<ZoneDetailsOutput> => {
    const response = await axiosInstance.get(`${endpoint}/${id}`);
    return response.data;
}












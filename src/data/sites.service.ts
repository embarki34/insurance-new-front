import axiosInstance from "@/config/axios";
import { SiteInput } from "@/lib/input-Types";



const endpoint = "/sites";



export const createSite = async (zoneId: string, site: SiteInput) => {
    const response = await axiosInstance.post(`${endpoint}/`, { ...site, zone: zoneId });
    return response.data;
}




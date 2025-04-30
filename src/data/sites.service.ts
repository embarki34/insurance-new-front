import axiosInstance from "@/config/axios";
import { SiteInput } from "@/lib/input-Types";



const endpoint = "/sites";



export const createSite = async (zoneId: string, site: SiteInput) => {
    const response = await axiosInstance.post(`${endpoint}/`, { ...site, zone: zoneId });
    return response.data;
}


// export const updateSite = async (siteId: string, site: SiteInput) => {
//     const response = await axiosInstance.put(`${endpoint}/${siteId}`, { ...site ,batiments });
//     return response.data;
// }


export const addBatiment = async (siteId: string, batimentId: string[]) => {
    const response = await axiosInstance.put(`${endpoint}/${siteId}`, { batiments: batimentId });
    return response.data;
}




import axiosInstance from "@/config/axios"  
import { PreLitigationInput } from "@/lib/types"
const endpoint = "/pre-litigations"




export const getPreLitigation = async (preLitigationId: string) => {
    const response = await axiosInstance.get(`${endpoint}/${preLitigationId}`)
    return response.data
}

export const createPreLitigation = async (data: PreLitigationInput) => {
    const response = await axiosInstance.post(`${endpoint}`, data)
    return response.data
}




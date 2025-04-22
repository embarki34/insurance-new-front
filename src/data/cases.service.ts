import axiosInstance from "@/config/axios"
import { caseEndpointResponse, caseInput } from "@/lib/types"


const endpoint = "/cases"


export const createCase = async (caseData: caseInput) => {
try {
        const response = await axiosInstance.post(`${endpoint}`, caseData)
        return response.data
    } catch (error) {
        return error
    }
}


export const getCases = async (): Promise<caseEndpointResponse> => {
    const response = await axiosInstance.get<caseEndpointResponse>(`${endpoint}`)
    return response.data
}


export const deleteCase = async (id: string) => {
    const response = await axiosInstance.delete(`${endpoint}/${id}`)
    return response.data
}


export const getCaseById = async (id: string) => {
    const response = await axiosInstance.get(`${endpoint}/${id}`)
    return response.data
}


export const changeCaseStatus = async (id: string, status: string) => {
    console.log(status)
    const response = await axiosInstance.put(`${endpoint}/${id}`, { status : status, updatedBy: "admin" })
    return response.data
}




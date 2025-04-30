import axiosInstance from "@/config/axios"
import { CompagnieInput } from "@/lib/input-Types"
import { CompagnieOutput } from "@/lib/output-Types"


const endpiont = "/societes"

export const getCompagnies = async () => {
    const response = await axiosInstance.get<CompagnieOutput[]>(`${endpiont}`)
    return response.data
}



export const createCompagnie = async (data: CompagnieInput) => {
    const response = await axiosInstance.post<CompagnieOutput>(`${endpiont}`, data)
    return response.data
}


export const updateCompagnie = async (id: string, data: Partial<CompagnieInput>) => {
    const response = await axiosInstance.put<CompagnieOutput>(`${endpiont}/${id}`, data)
    return response.data
}


export const deleteCompagnie = async (id: string) => {
    const response = await axiosInstance.delete<CompagnieOutput>(`${endpiont}/${id}`)
    return response.data
}







import axiosInstance from "@/config/axios"
import { Parameter } from "@/lib/types"




const endpoint = "/parameters"






export const getParameters = async (): Promise<Parameter[]> => {
  const response = await axiosInstance.get<Parameter[]>(`${endpoint}`)
  return response.data
}




export const createParameter = async (formData: {
  key: string;
  label: string;
  values: {
    key: string;
    label: string;
    linked_params: {
      param_key: string;
      allowed_values: string[];
    }[];
    hasDependencies: boolean;
  }[];
}) => {
  const response = await axiosInstance.post(`${endpoint}`, formData)
  return response.data
}


export const updateParameter = async (id: string, data: Parameter) => {
  const response = await axiosInstance.put(`${endpoint}/${id}`, data)
  return response.data
}


export const deleteParameter = async (id: string) => {
  const response = await axiosInstance.delete(`${endpoint}/${id}`)
  return response.data
}





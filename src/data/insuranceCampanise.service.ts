import axiosInstance from "@/config/axios";
import { InsuranceCampaniseInput } from "@/lib/input-Types";
import {  InsuranceCampaniseOutput } from "@/lib/output-Types"

const endpiont = "/insurance-companies"



export const getInsuranceCampanises = async () => {
  const response = await axiosInstance.get<InsuranceCampaniseOutput[]>(`${endpiont}`)
  return response.data
}

export const createInsuranceCampanise = async (data: InsuranceCampaniseInput) => {
  const response = await axiosInstance.post<InsuranceCampaniseOutput>(`${endpiont}`, data)
  return response.data
}


export const updateInsuranceCampanise = async (data: InsuranceCampaniseInput, id: string) => {
  const response = await axiosInstance.put<InsuranceCampaniseOutput>(`${endpiont}/${id}`, data)
  return response.data
}


export const deleteInsuranceCampanise = async (id: string) => {
  const response = await axiosInstance.delete<InsuranceCampaniseOutput>(`${endpiont}/${id}`)
  return response.data
}




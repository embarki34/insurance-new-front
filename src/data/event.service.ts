import axiosInstance from "@/config/axios"
import { eventInput } from "@/lib/types";

const endpoint = "/events";


export const updateEvent = async (eventId: string, data: Partial<eventInput>) => {
  const response = await axiosInstance.put(`${endpoint}/${eventId}`, data);
  return response.data;
};


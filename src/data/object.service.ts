import axiosInstance from "@/config/axios"
import { objectInput } from "@/lib/input-Types" 
import { getObjectsOutput } from "@/lib/output-Types"



const endpoints = '/objects'



// export const createObject = async (object: objectInput) => {
//     const response = await axiosInstance.post(endpoints, object)
//     return response.data
// }

export const createObjects = async (objects: objectInput[]) => {
    const response = await axiosInstance.post(endpoints + "/createmany", objects);
    return response.data;
}

export const getObjects = async  () => {
    try {
        const response = await axiosInstance.get<getObjectsOutput>(endpoints)
        console.log(response.data)
        
        // Make sure we're returning an array for objects
        // If response.data is already an array, use it directly
        const objectsArray = Array.isArray(response.data) ? response.data : 
                            (response.data?.objects || []);
        
        return {
            objects: objectsArray,
            // pagination: {
            //     currentPage: 1,
            //     totalPages: 1,
            //     totalItems: objectsArray.length,
            //     itemsPerPage: 10
            // }
        }
    } catch (error) {
        console.error("Error fetching objects:", error)
        return {
            objects: [],
            pagination: {
                currentPage: 1,
                totalPages: 1,
                totalItems: 0,
                itemsPerPage: 10
            }
        }
    }
}


export const deleteObject = async (id: string) => {
    const response = await axiosInstance.delete(endpoints + `/${id}`)
    return response.data
}



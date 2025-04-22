import axios from "axios"



 const baseURL = "http://10.20.0.26:3004/api/v1"


 
const axiosInstance = axios.create({
  baseURL: baseURL,
})





export default axiosInstance

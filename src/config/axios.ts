import axios from "axios"



 const baseURL = "https://assurance-test.condor.dz/api/v1"


 
const axiosInstance = axios.create({
  baseURL: baseURL,
})





export default axiosInstance

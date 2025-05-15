import axios from "axios"



// const baseURL = "https://assurance-test.condor.dz/api/v1"
 const baseURL = "http://10.20.0.26:3005/api/v1"


 
const axiosInstance = axios.create({
  baseURL: baseURL,
})





export default axiosInstance

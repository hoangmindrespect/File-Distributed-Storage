import axios from "axios";
import { config } from "./Constants";
// import { parseJwt } from './Helpers'

export const dfsApi = {
  login,
  register,
  uploadFile,
  downloadFile,
  deleteFile,
}

function login(user) {
  return instance.post("/login", user);
}

function register(user) {
  return instance.post("/register", user, {
    headers: { "Content-type": "application/json" },
  });
}

function uploadFile(formData){
  return instance.post("/file/upload", formData, {
  headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: bearerAuth(localStorage.getItem("token")),
    },
  });
}

function downloadFile(fileName){
  return instance.get(`/file/download/${fileName}`, {
    headers: {
      Authorization: bearerAuth(localStorage.getItem("token")),
    },
  });
}

function deleteFile(fileId){
  return instance.delete(`/file/delete/${fileId}`, {
    headers: {
      Authorization: bearerAuth(localStorage.getItem("token")),
    },
  });
}



// -- Axios

const instance = axios.create({
  baseURL: config.url.API_BASE_URL,
});

// instance.interceptors.request.use(function (config) {
//   // If token is expired, redirect user to login
//   if (config.headers.Authorization) {
//     const token = config.headers.Authorization.split(' ')[1]
//     const data = parseJwt(token)
//     if (Date.now() > data.exp * 1000) {
//       window.location.href = "/login"
//     }
//   }
//   return config
// }, function (error) {
//   return Promise.reject(error)
// })

// -- Helper functions

function bearerAuth(user) {
  return `Bearer ${user}`;
}

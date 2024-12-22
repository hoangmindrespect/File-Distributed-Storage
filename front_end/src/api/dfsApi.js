import axios from "axios";
import { config } from "./Constants";
// import { parseJwt } from './Helpers'

export const dfsApi = {
  login,
  register,
  getCurrentUser,
  uploadFile,
  downloadFile,
  deleteFile,
  renameFile,
  getFilesByUserId,
  getFoldersByUserId,
  createFolder,
  renameFolder,
  deleteFolder,
}

function login(user) {
  return instance.post("/login", user);
}

function register(user) {
  return instance.post("/register", user, {
    headers: { "Content-type": "application/json" },
  });
}

function getCurrentUser() {
  return instance.get("/currentuser", {
    headers: {
      Authorization: bearerAuth(localStorage.getItem("token")),
    },
  });
}

function uploadFile(formData, parentFolderId) {
  return instance.post(`/file/upload?parentFolderId=${encodeURIComponent(parentFolderId)}`, formData, {
  headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: bearerAuth(localStorage.getItem("token")),
    },
  });
}

function downloadFile(fileName){
  return instance.get(`/file/download`, {
    params: {
      file_name: fileName,
    },
    headers: {
      Authorization: bearerAuth(localStorage.getItem("token")),
    },
  });
}

function deleteFile(fileId){
  return instance.delete(`/file/delete`, {
    params: {
      file_id: fileId,
    },
    headers: {
      Authorization: bearerAuth(localStorage.getItem("token")),
    },
  });
}

function renameFile(fileId, newName) {
  return instance.put(
    `/file/rename?file_id=${encodeURIComponent(fileId)}&new_file_name=${encodeURIComponent(newName)}`,
    {},  // empty body
    {
      headers: {
        Authorization: bearerAuth(localStorage.getItem("token")),
      }
    }
  );
}

function getFilesByUserId(){
  return instance.get("/file/get_all", {
    headers: {
      Authorization: bearerAuth(localStorage.getItem("token")),
    },
  });
}

function getFoldersByUserId(){
  return instance.get("/directory/get_all_directories", {
    headers: {
      Authorization: bearerAuth(localStorage.getItem("token")),
    },
  });
}

function createFolder(folderName, parentFolderId){
  return instance.post("/directory/create", 
    {
      name: folderName,
      parent_id: parentFolderId,
    }, 
    {
      headers: {
        Authorization: bearerAuth(localStorage.getItem("token")),
      },
    }
  );
}

function renameFolder(folderId, newName) {
  return instance.put(
    `/directory/rename?folder_id=${encodeURIComponent(folderId)}&new_folder_name=${encodeURIComponent(newName)}`,
    {},  // empty body
    {
      headers: {
        Authorization: bearerAuth(localStorage.getItem("token")),
      }
    }
  );
}

function deleteFolder(folderId){
  return instance.delete(`/directory/delete`, {
    params: {
      folder_id: folderId,
    },
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

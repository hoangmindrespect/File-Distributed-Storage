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
  addToStarred,
  removeFromStarred,
  loadStarred,
  moveToTrash,
  restore,
  loadTrash,
  moveFolderToTrash,
  restoreFolder,
  loadTrashFolder,
  shareFile,
  shareFolder,
  getSharedFiles,
  getSharedFolders,
  moveFile,
  search
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

function addToStarred(fileId) {
  return instance.post(`/file/add_to_starred`, 
    {
      file_id: fileId,
      user_id: localStorage.getItem("userId"),
    },
    {
      headers: {
        Authorization: bearerAuth(localStorage.getItem("token")),
      },
    }
  );
}

function removeFromStarred(fileId) {
  return instance.post(`/file/remove_from_starred`, 
    {
      file_id: fileId,
      user_id: localStorage.getItem("userId"),
    },
    {
      headers: {
        Authorization: bearerAuth(localStorage.getItem("token")),
      },
    }
  );
}

function loadStarred(){
  return instance.get(`/file/load_starred`, {
    params: {
      user_id: localStorage.getItem("userId"),
    },
    headers: {
      Authorization: bearerAuth(localStorage.getItem("token")),
    },
  });
}

function moveToTrash(fileId) {
  return instance.post(`/file/move_to_trash`, 
    {
      file_id: fileId,
      user_id: localStorage.getItem("userId"),
    },
    {
      headers: {
        Authorization: bearerAuth(localStorage.getItem("token")),
      },
    }
  );
}

function restore(fileId) {
  return instance.post(`/file/restore`, 
    {
      file_id: fileId,
      user_id: localStorage.getItem("userId"),
    },
    {
      headers: {
        Authorization: bearerAuth(localStorage.getItem("token")),
      },
    }
  );
}

function loadTrash(){
  return instance.get(`/file/load_trash`, {
    params: {
      user_id: localStorage.getItem("userId"),
    },
    headers: {
      Authorization: bearerAuth(localStorage.getItem("token")),
    },
  });
}

function moveFolderToTrash(folderId) {
  return instance.post(`/directory/move_to_trash`, 
    {
      folder_id: folderId,
      user_id: localStorage.getItem("userId"),
    },
    {
      headers: {
        Authorization: bearerAuth(localStorage.getItem("token")),
      },
    }
  );
}

function restoreFolder(folderId) {
  return instance.post(`/directory/restore`, 
    {
      folder_id: folderId,
      user_id: localStorage.getItem("userId"),
    },
    {
      headers: {
        Authorization: bearerAuth(localStorage.getItem("token")),
      },
    }
  );
}

function loadTrashFolder(){
  return instance.get(`/directory/load_trash`, {
    params: {
      user_id: localStorage.getItem("userId"),
    },
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

function shareFile(fileId, emails) {
  return instance.post(`/file/share`,
    {
      file_id: fileId,
      emails: emails,
    },
    {
      headers: {
        Authorization: bearerAuth(localStorage.getItem("token")),
      },
    }
  );
}

function shareFolder(folderId, emails) {
  return instance.post(`/directory/share`,
    {
      folder_id: folderId,
      emails: emails,
    },
    {
      headers: {
        Authorization: bearerAuth(localStorage.getItem("token")),
      },
    }
  );
}

function getSharedFiles() {
  return instance.get(`/file/get_shared_files`, {
    headers: {
      Authorization: bearerAuth(localStorage.getItem("token")),
    },
  });
}

function getSharedFolders() {
  return instance.get(`/directory/get_shared_directories`, {
    headers: {
      Authorization: bearerAuth(localStorage.getItem("token")),
    },
  });
}

function moveFile(fileId, newParentId) {
  return instance.post('/file/move', {
    file_id: fileId,
    new_parent_id: newParentId
  }, {
    headers: {
      Authorization: bearerAuth(localStorage.getItem("token")),
    }
  });
}

function search(query) {
  return instance.get(`/search?q=${encodeURIComponent(query)}`, {
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

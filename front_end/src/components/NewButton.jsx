import { Plus, FolderPlus, Upload, FolderUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "../lib/utils";
import { dfsApi } from "../api/dfsApi";
import { toast } from "react-hot-toast";
import FileUploadProgress from "./ProgressBar";
import ProgressBar from "./ProgressBar";
import { useRefresh } from './context/RefreshContext';
import { X } from 'lucide-react';
import { user } from "@nextui-org/react";

const NewButton = ({ currentFolderId }) => {
  const { refreshData } = useRefresh();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const [progress, setProgress] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // const [userId, setUserId] = useState(null);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const userResponse = await dfsApi.getCurrentUser();
  //       setUserId(userResponse.data);
  //     } catch (error) {
  //       console.error("Error loading user data:", error);
  //     }
  //   };
  //   fetchData();
  // }, []);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onCloseModel = () => {
    setIsModalOpen(false);
    setNewFolderName("");
  }

  //New Folder
  const onClickAddNewFolder = () => {
    setIsModalOpen(true);
    setIsOpen(false);
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    try {
      const response = await dfsApi.createFolder(newFolderName, currentFolderId);
      if(response.status === 200){
        toast.success("Folder created successfully");
        refreshData();
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Error creating folder");
    }
    setIsModalOpen(false);
    setNewFolderName("");
  } 

  //Upload File
  const onClickUploadFile = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);

    const newUploads = files.map((file) => ({
      id: Math.random().toString(36),
      fileName: file.name,
      progressCount: 0,
      status: "pending",
    }));

    setProgress((prev) => [...prev, ...newUploads]);

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        // Start upload
        setProgress((prev) =>
          prev.map((upload) =>
            upload.fileName === file.name
              ? { ...upload, status: "uploading", progressCount: 0 }
              : upload
          )
        );

        const response =  await dfsApi.uploadFile(formData, currentFolderId);

        // Update on success
        setProgress((prev) =>
          prev.map((upload) =>
            upload.fileName === file.name
              ? { ...upload, progressCount: 100, status: "completed" }
              : upload
          )
        );
        if(response.status === 200){
          toast.success(`Uploaded ${file.name} successfully`);
          refreshData();
          setTimeout(() => {
            setProgress((prev) =>
              prev.filter((upload) => upload.fileName !== file.name)
            );
          }
          , 3000);
        }
      } catch (error) {
        setProgress((prev) =>
          prev.map((upload) =>
            upload.fileName === file.name
              ? { ...upload, status: "error" }
              : upload
          )
        );
        console.error("Upload failed:", error);
        toast.error("Upload failed");
      }
    }

    setIsOpen(false);
  };

  const handleCancelUploads = () => {
    setProgress([]);
  };

  //Upload Folder
  const onClickUploadFolder = () => {
    folderInputRef.current?.click();
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-full shadow-sm",
            "bg-white hover:bg-gray-50 border border-gray-200",
            "w-[180px] transition-all"
          )}
        >
          <Plus size={20} />
          <span className="font-medium">New</span>
        </button>

        {isOpen && (
          <div className="absolute left-4 top-14 w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <button
              onClick={onClickAddNewFolder}
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50"
            >
              <FolderPlus size={18} />
              <span>New Folder</span>
            </button>
            <button
              onClick={onClickUploadFile}
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50"
            >
              <Upload size={18} />
              <span>File Upload</span>
            </button>
            {/* <button
              onClick={onClickUploadFolder}
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50"
            >
              <FolderUp size={18} />
              <span>Folder Upload</span>
            </button> */}
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />

        <input
          type="file"
          ref={folderInputRef}
          className="hidden"
          webkitdirectory="true"
          directory="true"
          onChange={handleFileChange}
        />
      </div>
      {progress.length > 0 && (
        <ProgressBar progresses={progress} onCancel={handleCancelUploads} />
      )}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Folder</h3>
              <button onClick={() => onCloseModel()}>
                <X size={20}></X>
              </button>
            </div>

            <form onSubmit={handleCreateFolder}
              className="flex flex-col w-full">
              <input type="text" 
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                autoFocus
                className="w-full border border-gray-600 py-2 px-4 rounded-lg"
                required
              />

              <div className="mt-6 ml-auto">
                <button type="submit" className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600">
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default NewButton;

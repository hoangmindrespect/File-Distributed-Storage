import { Plus, FolderPlus, Upload, FolderUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "../lib/utils";
import { dfsApi } from "../api/dfsApi";
import { toast } from "react-hot-toast";
import FileUploadProgress from "./FileUploadProgress";

const NewButton = ({ currentFolderId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const [uploads, setUploads] = useState([]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //New Folder
  const onClickAddNewFolder = () => {
    // TODO: Implement new folder creation
    console.log("Create new folder");
    setIsOpen(false);
  };

  //Upload File
  const onClickUploadFile = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
  
    const newUploads = files.map((file) => ({
      id: Math.random().toString(36),
      fileName: file.name,
      progress: 0,
      status: "pending",
    }));
  
    setUploads((prev) => [...prev, ...newUploads]);
  
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("parentFolderId", currentFolderId);
  
        // Start upload
        setUploads((prev) =>
          prev.map((upload) =>
            upload.fileName === file.name
              ? { ...upload, status: "uploading", progress: 0 }
              : upload
          )
        );
  
        await dfsApi.uploadFile(formData);
  
        // Update on success
        setUploads((prev) =>
          prev.map((upload) =>
            upload.fileName === file.name
              ? { ...upload, progress: 100, status: "completed" }
              : upload
          )
        );
  
        toast.success(`Uploaded ${file.name} successfully`);
      }
    } catch (error) {
      // Update failed status
      setUploads((prev) =>
        prev.map((upload) =>
          upload.fileName === file.name
            ? { ...upload, status: "error" }
            : upload
        )
      );
      console.error("Upload failed:", error);
      toast.error("Upload failed");
    }
  
    setIsOpen(false);
  };

  const handleCancelUploads = () => {
    setUploads([]);
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
            <button
              onClick={onClickUploadFolder}
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50"
            >
              <FolderUp size={18} />
              <span>Folder Upload</span>
            </button>
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
      {uploads.length > 0 && (
        <FileUploadProgress uploads={uploads} onCancel={handleCancelUploads} />
      )}
    </>
  );
};

export default NewButton;

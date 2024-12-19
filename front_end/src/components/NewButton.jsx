import { Plus, FolderPlus, Upload, FolderUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "../lib/utils";
import { dfsApi } from "../api/dfsApi";

const NewButton = ({ currentFolderId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onClickAddNewFolder = () => {
    // TODO: Implement new folder creation
    console.log("Create new folder");
    setIsOpen(false);
  };

  //New File
  const onClickUploadFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', file.name);
        // If needed, you can get relative path for files in folder upload
        const relativePath = file.webkitRelativePath || file.name;
        formData.append('filePath', relativePath);
  
        const response = await dfsApi.uploadFile(formData);
        if (response.ok) {
          toast.success(`Uploaded ${file.name} successfully`);
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed');
    }
    
    setIsOpen(false);
  };

  const onClickUploadFolder = () => {
    folderInputRef.current?.click();
  };

  return (
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
  );
};

export default NewButton;

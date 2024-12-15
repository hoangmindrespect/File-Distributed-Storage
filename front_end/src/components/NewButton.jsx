import { Plus, FolderPlus, Upload, FolderUp } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';

const NewButton = () => {
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNewFolder = () => {
    // TODO: Implement new folder creation
    console.log("Create new folder");
    setIsOpen(false);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFolderUpload = () => {
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
        )}>
        <Plus size={20} />
        <span className="font-medium">New</span>
      </button>

      {isOpen && (
        <div className="absolute left-4 top-14 w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <button
            onClick={handleNewFolder}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
            <FolderPlus size={18} />
            <span>New Folder</span>
          </button>
          <button
            onClick={handleFileUpload}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
            <Upload size={18} />
            <span>File Upload</span>
          </button>
          <button
            onClick={handleFolderUpload}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
            <FolderUp size={18} />
            <span>Folder Upload</span>
          </button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          // Handle file upload
          console.log(e.target.files);
          setIsOpen(false);
        }}
      />
      
      <input
        type="file"
        ref={folderInputRef}
        className="hidden"
        webkitdirectory="true"
        directory="true"
        onChange={(e) => {
          // Handle folder upload
          console.log(e.target.files);
          setIsOpen(false);
        }}
      />
    </div>
  );
};

export default NewButton;
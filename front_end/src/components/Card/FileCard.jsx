import {
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  File,
} from "lucide-react";
import { FaFilePdf } from "react-icons/fa6";
import { LuFileText } from "react-icons/lu";
import { Download, Trash2, Edit } from "lucide-react";
import { ContextMenu, MenuItem } from "../ContextMenu";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const getFileIconAndStyle = (fileName) => {
  const extension = fileName.split(".").pop().toLowerCase();

  const fileTypes = {
    // Documents
    doc: { icon: LuFileText, style: "text-blue-600" },
    docx: { icon: LuFileText, style: "text-blue-600" },
    txt: { icon: LuFileText, style: "text-gray-600" },
    pdf: { icon: FaFilePdf, style: "text-red-500" },

    // Images
    png: { icon: FileImage, style: "text-green-500" },
    jpg: { icon: FileImage, style: "text-green-500" },
    jpeg: { icon: FileImage, style: "text-green-500" },
    gif: { icon: FileImage, style: "text-green-500" },

    // Video
    mp4: { icon: FileVideo, style: "text-purple-500" },
    mov: { icon: FileVideo, style: "text-purple-500" },
    avi: { icon: FileVideo, style: "text-purple-500" },

    // Audio
    mp3: { icon: FileAudio, style: "text-yellow-500" },
    wav: { icon: FileAudio, style: "text-yellow-500" },

    // Code
    js: { icon: FileCode, style: "text-yellow-400" },
    jsx: { icon: FileCode, style: "text-blue-400" },
    ts: { icon: FileCode, style: "text-blue-600" },
    tsx: { icon: FileCode, style: "text-blue-600" },
    html: { icon: FileCode, style: "text-orange-500" },
    css: { icon: FileCode, style: "text-indigo-500" },
  };

  return fileTypes[extension] || { icon: File, style: "text-gray-400" };
};

const FileCard = ({ file, onContextMenu,  activeContextMenu, setActiveContextMenu}) => {
  const { icon: IconComponent, style } = getFileIconAndStyle(file.name);
  const [contextMenu, setContextMenu] = useState(null);

  const handleContextMenu = (e) => {
    e.preventDefault();
    onContextMenu(e, { type: 'file', data: file });
  };

  const handleDownload = async () => {
    try {
      console.log("Download file", file.name);
      //await dfsApi.downloadFile(file.fileId);
    } catch (error) {
      toast.error("Failed to download file");
    }
  };

  const handleDelete = async () => {
    try {
      //await dfsApi.deleteFile(file.fileId);
      console.log("Delete file", file.fileId);
      toast.success("File deleted successfully");
    } catch (error) {
      toast.error("Failed to delete file");
    }
  };

  const handleRename = async () => {
    const newName = prompt("Enter new name:", file.name);
    if (newName && newName !== file.name) {
      try {
        //await dfsApi.renameFile(file.fileId, newName);
        toast.success("File renamed successfully");
      } catch (error) {
        toast.error("Failed to rename file");
      }
    }
  };

  return (
    <>
      <div
        onContextMenu={handleContextMenu}
        className="group cursor-pointer rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:shadow-sm transition-all p-10"
      >
        <div className="flex flex-col items-center gap-2">
          <IconComponent className={`h-8 w-8 ${style}`} />
          <span className="text-xs font-medium text-gray-600 text-center truncate w-full">
            {file.name}
          </span>
        </div>
        <div className="mt-2 text-[10px] text-gray-400 text-center">
          {new Date(file.createdAt).toLocaleDateString()}
        </div>
      </div>
      {activeContextMenu?.item?.type === 'file' && 
       activeContextMenu?.item?.data?.fileId === file.fileId && (
        <ContextMenu 
          x={activeContextMenu.x} 
          y={activeContextMenu.y}
          onClose={() => setActiveContextMenu(null)}
        >
          <MenuItem icon={Download} label="Download" onClick={handleDownload} />
          <MenuItem icon={Trash2} label="Delete" onClick={handleDelete} />
          <MenuItem icon={Edit} label="Rename" onClick={handleRename} />
        </ContextMenu>
      )}
    </>
  );
};

export default FileCard;

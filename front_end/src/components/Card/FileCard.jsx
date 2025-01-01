import {
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  File,
  StarIcon,
} from "lucide-react";

import { FaFilePdf } from "react-icons/fa6";
import { LuFileText } from "react-icons/lu";
import { BsFiletypeExe } from "react-icons/bs";
import { Download, Trash2, Edit, Share, RotateCw, Scissors} from "lucide-react";
import { ContextMenu, MenuItem } from "../context/ContextMenu";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { dfsApi } from "../../api/dfsApi";
import ProgressBar from "../ProgressBar";
import ShareModal from "../ShareModal";

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
    jfif: { icon: FileImage, style: "text-green-500" },

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

    //Exe
    exe: { icon: BsFiletypeExe, style: "text-red-500" },
  };

  return fileTypes[extension] || { icon: File, style: "text-gray-400" };
};

const FileCard = ({
  file,
  onContextMenu,
  activeContextMenu,
  setActiveContextMenu,
  onUpdate,
  isSharedView,
  isTrashView,
  onRestore,         // Add these new props
  onDeletePermanent,
  setClipboard
}) => {
  const { icon: IconComponent, style } = getFileIconAndStyle(file.file_name);
  const [progress, setProgress] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleContextMenu = (e) => {
    e.preventDefault();
    onContextMenu(e, { type: "file", data: file });
  };

  const handleCancelDownload = () => {
    setProgress([]);
  };

  const handleDownload = async () => {
    const newDownload = {
      id: Math.random().toString(36),
      fileName: file.file_name,
      progressCount: 0,
      status: "pending",
    };
    setProgress((prev) => [...prev, newDownload]);
    // Start download
    setProgress((prev) =>
      prev.map((progress) =>
        progress.fileName === file.file_name
          ? { ...progress, status: "downloading", progressCount: 0 }
          : progress
      )
    );

    try {
      const response = await dfsApi.downloadFile(file.file_id);
      if (response.status === 200) {
        setProgress((prev) =>
          prev.map((progress) =>
            progress.fileName === file.file_name
              ? { ...progress, progressCount: 100, status: "completed" }
              : progress
          )
        );
        toast.success(`File ${file.file_name} downloaded successfully`);
        setTimeout(() => {
          setProgress((prev) =>
            prev.filter((progress) => progress.fileName !== file.file_name)
          );
        }, 3000);
      }
    } catch (error) {
      setProgress((prev) =>
        prev.map((progress) =>
          progress.fileName === file.file_name
            ? { ...progress, status: "error" }
            : progress
        )
      );
      toast.error("Failed to download file");
    }
  };

  const handleCut = () => {
    setClipboard({
      type: 'file',
      id: file.file_id,
      operation: 'cut'
    });
    toast.success('File ready to move');
  };

  const handleDelete = async () => {
    try {
      await dfsApi.moveToTrash(file.file_id);
      toast.success("File was moved to trash successfully");
      onUpdate();
    } catch (error) {
      toast.error("Failed to move file to trash");
    }
  };

  const handleRename = async () => {
    const fileNameWithoutExtension = file.file_name.split(".").slice(0, -1).join(".");
    const newName = prompt("Enter new name:", fileNameWithoutExtension);
    if (newName && newName !== file.file_name) {
      try {
        await dfsApi.renameFile(file.file_id, newName);
        toast.success("File renamed successfully");
        onUpdate();
      } catch (error) {
        toast.error("Failed to rename file");
      }
    }
  };

  const handleAddToStarred = async () => {
    try {
      await dfsApi.addToStarred(file.file_id);
      toast.success("File was add to starred successfully");
      onUpdate();
    } catch (error) {
      toast.error("Failed to add to starred");
    }
  };

  const onClickShare = () => {
    setShowShareModal(true);
  };

  const handleShare = async (emails) => {
    try {
      await dfsApi.shareFile(file.file_id, emails);
      toast.success("File shared successfully");
    } catch (error) {
      toast.error("Failed to share file");
    }
  };

  return (
    <>
      <div
        onContextMenu={handleContextMenu}
        title={file.file_name}
        className="group cursor-pointer rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:shadow-sm transition-all p-10"
      >
        <div className="flex flex-col items-center gap-2">
          <IconComponent className={`h-8 w-8 ${style}`} />
          <span className="text-xs font-medium text-gray-600 text-center truncate w-full">
            {file.file_name}
          </span>
        </div>
        <div className="mt-2 text-[10px] text-gray-400 text-center">
          {new Date(file.upload_time).toLocaleDateString()}
        </div>
      </div>
      {activeContextMenu?.item?.type === "file" &&
        activeContextMenu?.item?.data?.file_id === file.file_id && (
          <ContextMenu x={activeContextMenu.x} y={activeContextMenu.y}>
            {isTrashView ? (
              // Trash view menu items
              <>
                <MenuItem icon={RotateCw} label="Restore" onClick={() => onRestore(file.file_id)} />
                <MenuItem icon={Trash2} label="Delete Permanently" onClick={() => onDeletePermanent(file.file_id)} />
              </>
            ) : isSharedView ? (
              // Shared view menu item
              <MenuItem icon={Download} label="Download" onClick={handleDownload} />
            ) : (
              // Regular view menu items
              <>
                <MenuItem icon={Download} label="Download" onClick={handleDownload} />
                <MenuItem icon={Edit} label="Rename" onClick={handleRename} />
                <MenuItem icon={Scissors} label="Cut" onClick={handleCut} />
                <MenuItem icon={Share} label="Share" onClick={onClickShare} />
                <MenuItem icon={StarIcon} label="Add to starred" onClick={handleAddToStarred} />
                <MenuItem icon={Trash2} label="Move to trash" onClick={handleDelete} />
              </>
            )}
          </ContextMenu>
        )}
      {progress.length > 0 && (
        <ProgressBar progresses={progress} onCancel={handleCancelDownload} />
      )}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={handleShare}
      />
    </>
  );
};

export default FileCard;

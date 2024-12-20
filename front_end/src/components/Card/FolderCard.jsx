import { Folder } from "lucide-react";
import { FaFolder } from "react-icons/fa";

import { Trash2, Edit } from "lucide-react";
import { ContextMenu, MenuItem } from "../ContextMenu";
import { useState, useEffect } from "react";

const FolderCard = ({ folder, onDoubleClick, onContextMenu, activeContextMenu, setActiveContextMenu }) => {
  const [contextMenu, setContextMenu] = useState(null);

  const handleContextMenu = (e) => {
    e.preventDefault();
    onContextMenu(e, { type: 'folder', data: folder });
  };

  const handleDelete = async () => {
    try {
      await dfsApi.deleteFolder(folder.folderId);
      toast.success("Folder deleted successfully");
    } catch (error) {
      toast.error("Failed to delete folder");
    }
  };

  const handleRename = async () => {
    const newName = prompt("Enter new name:", folder.name);
    if (newName && newName !== folder.name) {
      try {
        await dfsApi.renameFolder(folder.folderId, newName);
        toast.success("Folder renamed successfully");
      } catch (error) {
        toast.error("Failed to rename folder");
      }
    }
  };

  return (
    <>
      <div
        onContextMenu={handleContextMenu}
        className="group cursor-pointer rounded-lg border border-blue-100 p-4 bg-gray-200 hover:bg-blue-100/50 hover:shadow-md transition-all"
        onDoubleClick={() => onDoubleClick(folder.folderId)}
      >
        <div className="flex items-center gap-3">
          <FaFolder className="h-6 w-6 text-yellow-400" />
          <span className="text-sm font-medium text-gray-700">
            {folder.name}
          </span>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {new Date(folder.createdAt).toLocaleDateString()}
        </div>
      </div>
      {activeContextMenu?.item?.type === 'folder' && 
       activeContextMenu?.item?.data?.fileId === folder.fileId && (
        <ContextMenu 
          x={activeContextMenu.x} 
          y={activeContextMenu.y}
          onClose={() => setActiveContextMenu(null)}
        >
          <MenuItem icon={Trash2} label="Delete" onClick={handleDelete} />
          <MenuItem icon={Edit} label="Rename" onClick={handleRename} />
        </ContextMenu>
      )}
    </>
  );
};

export default FolderCard;

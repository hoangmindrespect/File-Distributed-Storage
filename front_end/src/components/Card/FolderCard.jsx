import { Folder } from "lucide-react";
import { FaFolder } from "react-icons/fa";

import { Trash2, Edit } from "lucide-react";
import { ContextMenu, MenuItem } from "../context/ContextMenu";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { dfsApi } from "../../api/dfsApi";


const FolderCard = ({ folder, onDoubleClick, onContextMenu, activeContextMenu, setActiveContextMenu, onUpdate }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const handleContextMenu = (e) => {
    e.preventDefault();
    onContextMenu(e, { type: 'folder', data: folder });
  };

  const handleDelete = async () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await dfsApi.deleteFolder(folder.folder_id);
      toast.success("Folder deleted successfully");
      onUpdate();
    } catch (error) {
      toast.error("Failed to delete folder");
    }
    setShowDeleteDialog(false);
  };

  const handleRename = async () => {
    const newName = prompt("Enter new name:", folder.name);
    if (newName && newName !== folder.name) {
      try {
        await dfsApi.renameFolder(folder.folder_id, newName);
        toast.success("Folder renamed successfully");
        onUpdate();
      } catch (error) {
        console.error("Error renaming folder:", error);
        toast.error("Failed to rename folder");
      }
    }
  };

  return (
    <>
      <div
        onContextMenu={handleContextMenu}
        className="group cursor-pointer rounded-lg border border-blue-100 p-4 bg-gray-200 hover:bg-blue-100/50 hover:shadow-md transition-all"
        onDoubleClick={() => onDoubleClick(folder.folder_id)}
      >
        <div className="flex items-center gap-3">
          <FaFolder className="h-6 w-6 text-yellow-400" />
          <span className="text-sm font-medium text-gray-700">
            {folder.name}
          </span>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {new Date(folder.update_at).toLocaleDateString()}
        </div>
      </div>
      {activeContextMenu?.item?.type === 'folder' && 
       activeContextMenu?.item?.data?.folder_id === folder.folder_id && (
        <ContextMenu 
          x={activeContextMenu.x} 
          y={activeContextMenu.y}
          onClose={() => setActiveContextMenu(null)}
        >
          <MenuItem icon={Trash2} label="Delete" onClick={handleDelete} />
          <MenuItem icon={Edit} label="Rename" onClick={handleRename} />
        </ContextMenu>
      )}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px]">
            <h3 className="text-lg font-medium text-red-600 mb-2">Delete Folder?</h3>
            <p className="text-gray-600 mb-4">
              Warning: This will permanently delete folder "{folder.name}" and <span className="font-bold">ALL folders/files</span> inside it. 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FolderCard;

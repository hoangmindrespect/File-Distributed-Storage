import { Folder, Share } from "lucide-react";
import { FaFolder } from "react-icons/fa";

import { Trash2, Edit, RotateCw } from "lucide-react";
import { ContextMenu, MenuItem } from "../context/ContextMenu";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { dfsApi } from "../../api/dfsApi";
import ShareModal from "../ShareModal";

const FolderCard = ({
  folder,
  onDoubleClick,
  onContextMenu,
  activeContextMenu,
  setActiveContextMenu,
  onUpdate,
  isTrashView,
  onRestore,
  onDeletePermanent,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showOpenFolderDialog, setShowOpenFolderDialog] = useState(false);

  const handleContextMenu = (e) => {
    e.preventDefault();
    onContextMenu(e, { type: "folder", data: folder });
  };

  const handleDelete = async () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      onDeletePermanent(folder.folder_id);
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

  const handleMoveToTrash = async () => {
    try {
      await dfsApi.moveFolderToTrash(folder.folder_id);
      toast.success("Folder was moved to trash successfully");
      onUpdate();
    } catch (error) {
      toast.error("Failed to move folder to trash");
    }
  };

  const handleShare = async (emails) => {
    try {
      await dfsApi.shareFolder(folder.folder_id, emails);
      toast.success("Folder shared successfully");
    } catch (error) {
      toast.error("Failed to share folder");
    }
  };

  return (
    <>
      <div
        onContextMenu={handleContextMenu}
        className="group cursor-pointer rounded-lg border border-blue-100 p-4 bg-gray-200 hover:bg-blue-100/50 hover:shadow-md transition-all"
        onDoubleClick={
          isTrashView
            ? () => {
                setShowOpenFolderDialog(true);
              }
            : () => onDoubleClick(folder.folder_id)
        }
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
      {activeContextMenu?.item?.type === "folder" &&
        activeContextMenu?.item?.data?.folder_id === folder.folder_id && (
          <ContextMenu x={activeContextMenu.x} y={activeContextMenu.y}>
            {isTrashView ? (
              // Trash view menu items
              <>
                <MenuItem
                  icon={RotateCw}
                  label="Restore"
                  onClick={() => onRestore(folder.folder_id)}
                />
                <MenuItem
                  icon={Trash2}
                  label="Delete Permanently"
                  onClick={handleDelete}
                />
              </>
            ) : (
              // Regular view menu items
              <>
                <MenuItem icon={Edit} label="Rename" onClick={handleRename} />
                <MenuItem
                  icon={Trash2}
                  label="Move to trash"
                  onClick={handleMoveToTrash}
                />
                {/* <MenuItem icon={Share} label="Share" onClick={() => setShowShareModal(true)}/> */}
              </>
            )}
          </ContextMenu>
        )}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={handleShare}
      />
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px]">
            <h3 className="text-lg font-medium text-red-600 mb-2">
              Delete Folder?
            </h3>
            <p className="text-gray-600 mb-4">
              Warning: This will permanently delete folder "{folder.name}" and{" "}
              <span className="font-bold">ALL folders/files</span> inside it.
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
      {showOpenFolderDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium mb-4 text-yellow-600">
              Folder Access Restricted
            </h3>
            <p className="text-gray-600 mb-6">
              {`Please restore "${folder.name}" to access its contents`}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowOpenFolderDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => onRestore(folder.folder_id)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Restore Folder
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FolderCard;

import { useState, useEffect } from "react";
import FileCard from "../components/Card/FileCard";
import { dfsApi } from "../api/dfsApi";
import { Trash2, RotateCw } from "lucide-react";
import { useRefresh } from "../components/context/RefreshContext";
import { toast } from "react-hot-toast";
import FolderCard from "../components/Card/FolderCard";
import { ContextMenu } from "../components/context/ContextMenu";
import { MenuItem } from "@mui/material";

const Trash = () => {
  const [trashedFiles, setTrashedFiles] = useState([]);
  const [trashedFolders, setTrashedFolders] = useState([]);
  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadTrashItems = async () => {
    try {
      setIsLoading(true);
      const [fileResponse, folderResponse] = await Promise.all([
        dfsApi.loadTrash(),
        dfsApi.loadTrashFolder()
      ]);
      setTrashedFiles(fileResponse.data.data || []);
      setTrashedFolders(folderResponse.data.data || []);
    } catch (error) {
      toast.error("Failed to load trash items");
      console.error("Error loading trash:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrashItems();
  }, []);

  useEffect(() => {
    const handleClick = () => setActiveContextMenu(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleContextMenu = (e, itemData) => {
    e.preventDefault();
    setActiveContextMenu({
      x: e.pageX,
      y: e.pageY,
      item: itemData,
    });
  };

  const handleRestore = async (itemId, itemType) => {
    try {
      if (itemType === "file") {
        await dfsApi.restore(itemId);
      } else {
        await dfsApi.restoreFolder(itemId);
      }
      toast.success(`${itemType} restored successfully`);
      loadTrashItems();
    } catch (error) {
      toast.error(`Failed to restore ${itemType}`);
    }
  };

  const handleDeletePermanently = async (itemId, itemType) => {
    try {
      if (itemType === "file") {
        await dfsApi.deleteFile(itemId);
      } else {
        await dfsApi.deleteFolder(itemId);
      }
      toast.success(`${itemType} deleted permanently`);
      loadTrashItems();
    } catch (error) {
      toast.error(`Failed to delete ${itemType}`);
    }
  };

  const EmptyTrash = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
      <Trash2 size={64} className="mb-4 text-gray-400" />
      <h3 className="text-xl font-medium mb-2">Trash is empty</h3>
      <p className="text-sm text-gray-400">
        No items in trash
      </p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="p-6" onClick={() => setActiveContextMenu(null)}>
      {!trashedFiles.length && !trashedFolders.length ? (
        <EmptyTrash />
      ) : (
        <div>
          {/* Folders Section */}
          {trashedFolders.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-medium mb-4">Folders</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {trashedFolders.map((folder) => (
                  <FolderCard
                    key={folder.folder_id}
                    folder={folder}
                    onContextMenu={handleContextMenu}
                    activeContextMenu={activeContextMenu}
                    setActiveContextMenu={setActiveContextMenu}
                    onUpdate={loadTrashItems}
                    isTrashView={true}
                    onRestore={(id) => handleRestore(id, "folder")}
                    onDeletePermanent={(id) => handleDeletePermanently(id, "folder")}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Files Section */}
          {trashedFiles.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-4">Files</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {trashedFiles.map((file) => (
                  <FileCard
                    key={file.file_id}
                    file={file}
                    onContextMenu={handleContextMenu}
                    activeContextMenu={activeContextMenu}
                    setActiveContextMenu={setActiveContextMenu}
                    onUpdate={loadTrashItems}
                    isTrashView={true}
                    onRestore={(id) => handleRestore(id, "file")}
                    onDeletePermanent={(id) => handleDeletePermanently(id, "file")}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Trash;

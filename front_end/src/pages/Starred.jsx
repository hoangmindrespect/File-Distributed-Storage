import { useState, useEffect } from "react";
import FileCard from "../components/Card/FileCard";
import { dfsApi } from "../api/dfsApi";
import { Edit, Star, Trash2 } from "lucide-react";
import { useRefresh } from "../components/context/RefreshContext";
import { toast } from "react-hot-toast";

const Starred = () => {
  const [starredFiles, setStarredFiles] = useState([]);
  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const { refreshKey } = useRefresh();
  const [secondRefreshKey, setSecondRefreshKey] = useState(0);

  useEffect(() => {
    const fetchStarredFiles = async () => {
      try {
        const response = await dfsApi.loadStarred();
        setStarredFiles(response.data.data || []);
      } catch (error) {
        console.error("Error loading starred files:", error);
      }
    };
    fetchStarredFiles();
  }, [refreshKey,secondRefreshKey]);

  const handleContextMenu = (e, file) => {
    e.preventDefault();
    setActiveContextMenu({
      x: e.pageX,
      y: e.pageY,
      file,
    });
  };

  const handleRemoveStar = async (fileId) => {
    try {
      await dfsApi.removeFromStarred(fileId);
      toast.success("File was removed from starred successfully");
      refreshData(); 
    } catch (error) {
      toast.error("Failed to remove file from starred");
    } finally {
      setActiveContextMenu(null); // Ẩn menu
    }
  };

  const handleMoveToTrash = async (fileId) => {
    try {
        await dfsApi.moveToTrash(fileId);
        toast.success("File was moved to trash successfully");
        refreshData(); 
      } catch (error) {
        toast.error("Failed to move file to trash");
      }
      finally {
        setActiveContextMenu(null); // Ẩn menu
      }
  };

  const handleRename = async (fileName, fileId) => {
    const fileNameWithoutExtension = fileName.split(".").slice(0, -1).join(".");
    const newName = prompt("Enter new name:", fileNameWithoutExtension);
    if (newName && newName !== fileName) {
      try {
        await dfsApi.renameFile(fileId, newName);
        toast.success("File was renamed successfully");
        refreshData(); 
      } catch (error) {
        toast.error("Failed to rename file");
      } finally {
        setActiveContextMenu(null); // Ẩn menu
      }
    }

  };
  const handleClickOutside = () => {
    setActiveContextMenu(null);
  };

  const refreshData = () => {
    setSecondRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const EmptyStarred = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
      <Star size={64} className="mb-4 text-gray-400" />
      <h3 className="text-xl font-medium mb-2">No Starred Files</h3>
      <p className="text-sm text-gray-400">
        Mark files as starred to see them here
      </p>
    </div>
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-medium text-gray-700 mb-6">Starred</h2>
      {starredFiles.length === 0 ? (
        <EmptyStarred />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 min-w-[120px]">
          {starredFiles.map((file) => (
            <FileCard
              key={file.file_id}
              file={file}
              onContextMenu={(e) => handleContextMenu(e, file)}
              activeContextMenu={activeContextMenu}
              setActiveContextMenu={setActiveContextMenu}
            />
          ))}
        </div>
      )}
      {activeContextMenu && (
        <div
          style={{
            position: "absolute",
            top: activeContextMenu.y,
            left: activeContextMenu.x,
          }}
          className="bg-white border border-gray-200 rounded-md shadow-lg py-2 w-48 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100"
            onClick={() => handleRemoveStar(activeContextMenu.file.file_id)}
          >
            <Star className="w-4 h-4 text-gray-500 mr-2" />
            Remove From Star
          </button>
          <button
            className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100"
            onClick={() => handleMoveToTrash(activeContextMenu.file.file_id)}
          >
            <Trash2 className="w-4 h-4 text-gray-500 mr-2" />
            Move To Trash
          </button>
          <button
            className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100"
            onClick={() => handleRename(activeContextMenu.file.file_name, activeContextMenu.file.file_id)}
          >
            <Edit className="w-4 h-4 text-gray-500 mr-2" />
            Rename
          </button>
        </div>
      )}
    </div>
  );
};

export default Starred;

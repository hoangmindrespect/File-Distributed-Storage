import { useState, useEffect } from "react";
import FileCard from "../components/Card/FileCard";
import { dfsApi } from "../api/dfsApi";
import { Trash2, RotateCw } from "lucide-react";
import { useRefresh } from "../components/context/RefreshContext";
import { toast } from "react-hot-toast";

const Trash = () => {
  const [trashedFiles, setTrashedFiles] = useState([]);
  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const { refreshKey } = useRefresh();
  const [secondRefreshKey, setSecondRefreshKey] = useState(0);

  useEffect(() => {
    const fetchTrashedFiles = async () => {
      try {
        const response = await dfsApi.loadTrash();
        setTrashedFiles(response.data.data || []);
      } catch (error) {
        console.error("Error loading trashed files:", error);
      }
    };
    fetchTrashedFiles();
  }, [refreshKey, secondRefreshKey]);

  const handleContextMenu = (e, file) => {
    e.preventDefault();
    setActiveContextMenu({
      x: e.pageX,
      y: e.pageY,
      file,
    });
  };

  const handleRestoreFile = async (fileId) => {
    try {
      await dfsApi.restore(fileId);
      toast.success("File was restored successfully");
      refreshData();
    } catch (error) {
      console.error("Error restoring file:", error);
      toast.success("Restored fail");
    } finally{
      setActiveContextMenu(null);
    }
  };

  const handleDeletePermanently = async (fileId) => {
    try {
      await dfsApi.deleteFile(fileId);
      toast.success("File was deleted successfully");
      refreshData();
    } catch (error) {
      console.error("Error deleting file permanently:", error);
      toast.success("Deleted fail");
    } finally{
      setActiveContextMenu(null);
    }
  };

  const handleClickOutside = () => {
    setActiveContextMenu(null);
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const refreshData = () => {
    setSecondRefreshKey((prev) => prev + 1);
  };

  const EmptyTrash = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
      <Trash2 size={64} className="mb-4 text-gray-400" />
      <h3 className="text-xl font-medium mb-2">Trash is Empty</h3>
      <p className="text-sm text-gray-400">Files you delete will appear here</p>
    </div>
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-medium text-gray-700 mb-6">Trash</h2>
      {trashedFiles.length === 0 ? (
        <EmptyTrash />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 min-w-[120px]">
          {trashedFiles.map((file) => (
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
            onClick={() => handleRestoreFile(activeContextMenu.file.file_id)}
          >
            <RotateCw className="w-4 h-4 text-gray-500 mr-2" />
            Restore
          </button>
          <button
            className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100"
            onClick={() => handleDeletePermanently(activeContextMenu.file.file_id)}
          >
            <Trash2 className="w-4 h-4 text-gray-500 mr-2" />
            Delete Permanently
          </button>
        </div>
      )}
    </div>
  );
};

export default Trash;

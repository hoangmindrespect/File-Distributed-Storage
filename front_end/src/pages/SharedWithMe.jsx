import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dfsApi } from "../api/dfsApi";
import FileCard from "../components/Card/FileCard";
import FolderCard from "../components/Card/FolderCard";
import { FolderOpen } from "lucide-react";
import { useRefresh } from '../components/context/RefreshContext';

const SharedWithMe = () => {
  const [sharedFolders, setSharedFolders] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const navigate = useNavigate();
  const { refreshKey } = useRefresh();
  const [secondRefreshKey, setSecondRefreshKey] = useState(0);

  useEffect(() => {
    const fetchSharedItems = async () => {
      try {
        setIsLoading(true);
        const [foldersRes, filesRes] = await Promise.all([
          dfsApi.getSharedFolders(),
          dfsApi.getSharedFiles()
        ]);
        
        setSharedFolders(foldersRes.data.data || []);
        setSharedFiles(filesRes.data.data || []);
      } catch (error) {
        console.error("Error loading shared items:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSharedItems();
  }, [refreshKey, secondRefreshKey]);

  const handleContextMenu = (e, itemData) => {
    e.preventDefault();
    setActiveContextMenu({
      x: e.pageX,
      y: e.pageY,
      item: itemData,
    });
  };

  const handleFolderDoubleClick = (folderId) => {
    navigate(`/my-drive/${folderId}`);
  };

  const refreshData = () => {
    setSecondRefreshKey(prev => prev + 1);
  };

  const EmptyShared = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
      <FolderOpen size={64} className="mb-4 text-gray-400" />
      <h3 className="text-xl font-medium mb-2">No items shared with you</h3>
      <p className="text-sm text-gray-400">
        Items shared with you will appear here
      </p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Shared with me</h1>
      
      {!sharedFolders.length && !sharedFiles.length ? (
        <EmptyShared />
      ) : (
        <div className="space-y-8">
          {sharedFolders.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-gray-700 mb-4">Folders</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sharedFolders.map((folder) => (
                  <FolderCard
                    key={folder.folder_id}
                    folder={folder}
                    onContextMenu={handleContextMenu}
                    onDoubleClick={() => handleFolderDoubleClick(folder.folder_id)}
                  />
                ))}
              </div>
            </div>
          )}

          {sharedFiles.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-gray-700 mb-4">Files</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {sharedFiles.map((file) => (
                  <FileCard
                    key={file.file_id}
                    file={file}
                    onContextMenu={handleContextMenu}
                    activeContextMenu={activeContextMenu}
                    setActiveContextMenu={setActiveContextMenu}
                    onUpdate={refreshData}
                    isSharedView={true} // Add flag to indicate shared view
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeContextMenu && (
        <div
          className="fixed inset-0"
          onClick={() => setActiveContextMenu(null)}
        />
      )}
    </div>
  );
};

export default SharedWithMe;
import { useState, useEffect } from "react";
import FolderCard from "../components/Card/FolderCard";
import FileCard from "../components/Card/FileCard";
import { dfsApi } from "../api/dfsApi";
import { useParams, useNavigate } from "react-router-dom";
import { FolderOpen } from "lucide-react";
import { useRefresh } from "../components/context/RefreshContext";
import { toast } from "react-hot-toast";

import { Clipboard } from "lucide-react";

const MyDrive = () => {
  const [allFolders, setAllFolders] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [childFolders, setChildFolders] = useState([]);
  const [childFiles, setChildFiles] = useState([]);
  const [clipboard, setClipboard] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const navigate = useNavigate();
  const [activeContextMenu, setActiveContextMenu] = useState(null);
  // const [refreshKey, setRefreshKey] = useState(0);
  const { refreshKey } = useRefresh();
  const [secondRefreshKey, setSecondRefreshKey] = useState(0);

  const [userId, setUserId] = useState(null);
  localStorage.setItem("userId", userId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await dfsApi.getCurrentUser();
        setUserId(userResponse.data);
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    console.log(clipboard);
  }, [clipboard]);

  const { folder_id = `folder-root-${userId}` } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const folderResponse = await dfsApi.getFoldersByUserId();
        const fileResponse = await dfsApi.getFilesByUserId();

        setAllFolders(folderResponse.data.data || []);
        setAllFiles(fileResponse.data.data || []);
      } catch (error) {
        console.error("Error loading drive data:", error);
      }
    };
    fetchData();
  }, [refreshKey, secondRefreshKey]);

  // Second useEffect for processing folder structure
  useEffect(() => {
    const fetchData = async () => {
      try {
        const folder = allFolders.find((f) => f.folder_id === folder_id);
        setCurrentFolder(folder);

        const folders = allFolders.filter((f) =>
          folder.child_folder_id.includes(f.folder_id)
        );
        setChildFolders(folders);

        const files = allFiles.filter((f) =>
          folder.child_file_id.includes(f.file_id)
        );
        setChildFiles(files);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    fetchBreadcrumbs(folder_id);
    fetchData();
  }, [allFolders, allFiles, folder_id]);

  const fetchBreadcrumbs = async (currentFolderId) => {
    try {
      const path = [];
      let currentId = currentFolderId;

      while (currentId) {
        const folder = allFolders.find((f) => f.folder_id === currentId);
        if (folder) {
          path.unshift({ id: folder.folder_id, name: folder.name });
          currentId = folder.parent_id;
        } else {
          break;
        }
      }

      setBreadcrumbs(path);
    } catch (error) {
      console.error("Error loading breadcrumbs:", error);
    }
  };

  const handlePaste = async () => {
    if (!clipboard) return;

    try {
      await dfsApi.moveFile(clipboard.id, folder_id);
      toast.success("File moved successfully");
      setClipboard(null); // Clear clipboard after paste
      refreshData();
    } catch (error) {
      toast.error("Failed to move file");
      console.error(error);
    }
  };

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

  const handleBreadcrumbClick = (folder_id) => {
    navigate(`/my-drive/${folder_id}`);
  };

  const handleFolderDoubleClick = (folder_id) => {
    navigate(`/my-drive/${folder_id}`);
  };

  const refreshData = () => {
    setSecondRefreshKey((prev) => prev + 1);
  };

  const EmptyFolder = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
      <FolderOpen size={64} className="mb-4 text-gray-400" />
      <h3 className="text-xl font-medium mb-2">This folder is empty</h3>
      <p className="text-sm text-gray-400">Use the New button to add content</p>
    </div>
  );

  return (
    <div className="p-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 mb-2 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.id} className="flex items-center">
            {index > 0 && <span className="mx-2 text-gray-400">/</span>}
            <button
              onClick={() => handleBreadcrumbClick(crumb.id)}
              className="hover:text-blue-500 text-xl font-bold transition-colors"
            >
              {crumb.name}
            </button>
          </div>
        ))}
      </div>

      {!childFolders.length && !childFiles.length ? (
        <EmptyFolder />
      ) : (
        <>
          {/* Add paste button in empty folder view */}
          {clipboard && (
            <button
              onClick={handlePaste}
              className="flex items-center gap-2 px-4 py-2 my-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Clipboard className="h-4 w-4" />
              Paste
            </button>
          )}
          {/* Folders Section */}
          {childFolders.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-700 mb-4">
                Folders
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 min-w-[150px]">
                {childFolders.map((folder) => (
                  <FolderCard
                    key={folder.folder_id}
                    folder={folder}
                    onDoubleClick={handleFolderDoubleClick}
                    onContextMenu={handleContextMenu}
                    activeContextMenu={activeContextMenu}
                    setActiveContextMenu={setActiveContextMenu}
                    onUpdate={refreshData}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Files Section */}
          {childFiles.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-gray-700 mb-4">Files</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 min-w-[120px]">
                {childFiles.map((file) => (
                  <FileCard
                    key={file.file_id}
                    file={file}
                    onContextMenu={handleContextMenu}
                    activeContextMenu={activeContextMenu}
                    setActiveContextMenu={setActiveContextMenu}
                    onUpdate={refreshData}
                    setClipboard={setClipboard}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyDrive;

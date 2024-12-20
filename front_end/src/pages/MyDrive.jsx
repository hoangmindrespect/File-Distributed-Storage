import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FolderCard from '../components/Card/FolderCard';
import FileCard from '../components/Card/FileCard';

const MyDrive = () => {
  const [currentFolder, setCurrentFolder] = useState(null);
  const [childFolders, setChildFolders] = useState([]);
  const [childFiles, setChildFiles] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const navigate = useNavigate();
  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const { folderId = 'folder-root' } = useParams();

  const fetchBreadcrumbs = async (currentFolderId) => {
    try {
      const response = await fetch('/dataset.json');
      const data = await response.json();
      const path = [];
      let currentId = currentFolderId;

      while (currentId) {
        const folder = data.folders.find(f => f.folderId === currentId);
        if (folder) {
          path.unshift({ id: folder.folderId, name: folder.name });
          currentId = folder.parentId;
        } else {
          break;
        }
      }

      setBreadcrumbs(path);
    } catch (error) {
      console.error('Error loading breadcrumbs:', error);
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
      item: itemData
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/dataset.json');
        const data = await response.json();
        
        const folder = data.folders.find(f => f.folderId === folderId);
        setCurrentFolder(folder);
        
        const folders = data.folders.filter(f => folder.childFolders.includes(f.folderId));
        setChildFolders(folders);
        
        const files = data.files.filter(f => folder.childFiles.includes(f.fileId));
        setChildFiles(files);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    fetchBreadcrumbs(folderId);
    fetchData();
  }, [folderId]);

  const handleBreadcrumbClick = (folderId) => {
    navigate(`/my-drive/${folderId}`);
  };

  const handleFolderDoubleClick = (folderId) => {
    navigate(`/my-drive/${folderId}`);
  };

  return (
    <div className="p-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 mb-6 text-sm">
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
      
      {/* Folders Section */}
      {childFolders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Folders</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {childFolders.map(folder => (
              <FolderCard
                key={folder.folderId}
                folder={folder}
                onDoubleClick={handleFolderDoubleClick}
                onContextMenu={handleContextMenu}
                activeContextMenu={activeContextMenu}
                setActiveContextMenu={setActiveContextMenu}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Files Section */}
      {childFiles.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-700 mb-4">Files</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {childFiles.map(file => (
              <FileCard 
                key={file.fileId} 
                file={file} 
                onContextMenu={handleContextMenu}
                activeContextMenu={activeContextMenu}
                setActiveContextMenu={setActiveContextMenu}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDrive;
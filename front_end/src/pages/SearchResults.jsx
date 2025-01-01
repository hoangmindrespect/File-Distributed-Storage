import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { dfsApi } from "../api/dfsApi";
import FileCard from "../components/Card/FileCard";
import FolderCard from "../components/Card/FolderCard";
import { Search, Clipboard } from "lucide-react";
import { useRefresh } from "../components/context/RefreshContext";
import { toast } from "react-hot-toast";

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("query");
    const [results, setResults] = useState({ files: [], folders: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [clipboard, setClipboard] = useState(null);
    const [activeContextMenu, setActiveContextMenu] = useState(null);
    const navigate = useNavigate();
    const { refreshKey } = useRefresh();
    const [secondRefreshKey, setSecondRefreshKey] = useState(0);

  useEffect(() => {
    const handleClick = () => setActiveContextMenu(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        const response = await dfsApi.search(query);
        setResults(response.data.data);
      } catch (error) {
        console.error("Search error:", error);
        toast.error("Failed to fetch search results");
      } finally {
        setIsLoading(false);
      }
    };

    if (query) {
      fetchResults();
    }
  }, [query, refreshKey, secondRefreshKey]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );
  }

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
    setSecondRefreshKey((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Search results for "{query}"</h1>

      {clipboard && (
        <button
          onClick={handlePaste}
          className="flex items-center gap-2 px-4 py-2 my-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Clipboard className="h-4 w-4" />
          Paste
        </button>
      )}

      {!results.folders?.length && !results.files?.length ? (
        <div className="flex flex-col items-center justify-center h-[40vh] text-gray-500">
          <Search size={64} className="mb-4 text-gray-400" />
          <h3 className="text-xl font-medium mb-2">No results found</h3>
          <p className="text-sm text-gray-400">Try different keywords or check your spelling</p>
        </div>
      ) : (
        <>
          {results.folders?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-700 mb-4">Folders</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.folders.map(folder => (
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

          {results.files?.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-gray-700 mb-4">Files</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.files.map(file => (
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

export default SearchResults;

import { Folder } from 'lucide-react';
import { FaFolder } from "react-icons/fa";

const FolderCard = ({ folder, onDoubleClick }) => {
  return (
    <div
      className="group cursor-pointer rounded-lg border border-blue-100 p-4 
                 bg-gray-200 hover:bg-blue-100/50 hover:shadow-md transition-all"
      onDoubleClick={() => onDoubleClick(folder.folderId)}
    >
      <div className="flex items-center gap-3">
        <FaFolder className="h-6 w-6 text-yellow-400" />
        <span className="text-sm font-medium text-gray-700">{folder.name}</span>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        {new Date(folder.updatedAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default FolderCard;
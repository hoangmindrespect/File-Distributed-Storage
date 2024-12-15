import { 
  FileText, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  FileCode,
  File
} from 'lucide-react';
import { FaFilePdf } from "react-icons/fa6";
import { LuFileText } from "react-icons/lu";


const getFileIconAndStyle = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  
  const fileTypes = {
    // Documents
    'doc': { icon: LuFileText, style: 'text-blue-600' },
    'docx': { icon: LuFileText, style: 'text-blue-600' },
    'txt': { icon: LuFileText, style: 'text-gray-600' },
    'pdf': { icon: FaFilePdf, style: 'text-red-500' },
    
    // Images
    'png': { icon: FileImage, style: 'text-green-500' },
    'jpg': { icon: FileImage, style: 'text-green-500' },
    'jpeg': { icon: FileImage, style: 'text-green-500' },
    'gif': { icon: FileImage, style: 'text-green-500' },
    
    // Video
    'mp4': { icon: FileVideo, style: 'text-purple-500' },
    'mov': { icon: FileVideo, style: 'text-purple-500' },
    'avi': { icon: FileVideo, style: 'text-purple-500' },
    
    // Audio
    'mp3': { icon: FileAudio, style: 'text-yellow-500' },
    'wav': { icon: FileAudio, style: 'text-yellow-500' },
    
    // Code
    'js': { icon: FileCode, style: 'text-yellow-400' },
    'jsx': { icon: FileCode, style: 'text-blue-400' },
    'ts': { icon: FileCode, style: 'text-blue-600' },
    'tsx': { icon: FileCode, style: 'text-blue-600' },
    'html': { icon: FileCode, style: 'text-orange-500' },
    'css': { icon: FileCode, style: 'text-indigo-500' },
  };

  return fileTypes[extension] || { icon: File, style: 'text-gray-400' };
};

const FileCard = ({ file }) => {
  const { icon: IconComponent, style } = getFileIconAndStyle(file.name);

  return (
    <div className="group cursor-pointer rounded-lg border border-gray-200 
                    bg-white hover:bg-gray-50 hover:shadow-sm transition-all
                    p-10">
      <div className="flex flex-col items-center gap-2">
        <IconComponent className={`h-8 w-8 ${style}`} />
        <span className="text-xs font-medium text-gray-600 text-center truncate w-full">
          {file.name}
        </span>
      </div>
      <div className="mt-2 text-[10px] text-gray-400 text-center">
        {new Date(file.updatedAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default FileCard;
import { Loader2, X, CheckCircle2, XCircle } from "lucide-react";
import { useEffect } from "react";

const FileUploadProgress = ({ uploads, onCancel }) => {
  // useEffect(() => {
  //   const allCompleted = uploads.every(
  //     (upload) => upload.status === "completed" || upload.status === "error"
  //   );

  //   let timeoutId;
  //   if (allCompleted && uploads.length > 0) {
  //     timeoutId = setTimeout(() => {
  //       onCancel();
  //     }, 5000);
  //   }

  //   return () => {
  //     if (timeoutId) {
  //       clearTimeout(timeoutId);
  //     }
  //   };
  // }, [uploads, onCancel]);

  const getProgressColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "processing":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pending...";
      case "uploading":
        return "Uploading...";
      case "processing":
        return "Processing...";
      case "completed":
        return "Completed";
      case "error":
        return "Failed";
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 size={16} className="text-green-500" />;
      case "error":
        return <XCircle size={16} className="text-red-500" />;
      case "pending":
      case "uploading":
      case "processing":
        return <Loader2 size={16} className="animate-spin text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Uploading Files</h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        </div>

        <div className="">
          {uploads.map((upload) => (
            <div key={upload.id} className="text-sm mb-8">
              <div className="flex justify-between mb-1 items-center">
                <span className="truncate max-w-[60%]">{upload.fileName}</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(upload.status)}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor(
                    upload.status
                  )}`}
                  style={{ width: `${upload.progress}%` }}
                />
                <span className="text-gray-600">
                  {getStatusText(upload.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileUploadProgress;

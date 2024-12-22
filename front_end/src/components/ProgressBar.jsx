import { Loader2, X, CheckCircle2, XCircle } from "lucide-react";
import { use } from "react";
import { useEffect } from "react";

const ProgressBar = ({ progresses, onCancel }) => {
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
      case "downloading":
        return "Downloading...";
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
    console.log(status);
    switch (status) {
      case "completed":
        return <CheckCircle2 size={16} className="text-green-500" />;
      case "error":
        return <XCircle size={16} className="text-red-500" />;
      case "pending":
      case "uploading":
      case "downloading":
        return <Loader2 size={16} className="animate-spin text-blue-500" />;
      default:
        return null;
    }
  };

  useEffect(() => {
    console.log(progresses);
  }
  , [progresses]);

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
          {progresses.map((progress) => (
            <div key={progress.id} className="text-sm mb-8">
              <div className="flex justify-between mb-1 items-center">
                <span className="truncate max-w-[60%]">{progress.fileName}</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(progress.status)}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor(
                    progress.status
                  )}`}
                  style={{ width: `${progress.progressCount}%` }}
                />
                <span className="text-gray-600">
                  {getStatusText(progress.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;

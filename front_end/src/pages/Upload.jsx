import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setSelectedFile(acceptedFiles[0]);
    },
  });

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <div className="m-auto w-2/3 md:w-1/2 lg:w-1/3 flex flex-col justify-center">
        <div
          {...getRootProps()}
          className={` h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-white"
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-gray-500">
            {isDragActive ? (
              "Drop files to Attach"
            ) : selectedFile ? (
              <span className="border-2 rounded-lg px-4 py-4 border-blue-500 text-black">
                {selectedFile.name}
              </span>
            ) : (
              <>
                <span>Drop files to Attach, or </span>
                <span className="text-blue-500 cursor-pointer">browse</span>
              </>
            )}
          </p>
        </div>
        <button
          onClick={() => alert("Uploading: " + selectedFile.name)}
          className="mx-auto justify-center rounded-md bg-black mt-12 px-8 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
        >
          Upload
        </button>
      </div>
    </div>
  );
};

export default Upload;

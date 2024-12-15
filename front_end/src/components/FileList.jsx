import React, { useState, useEffect } from "react";

const FileList = () => {
    const folders = ["_Redist", "Content", "Mods", "save-backups", "smapi-internal"];
    const files = ["api-ms-win-core1.dll", "api-ms-win-core2.dll", "api-ms-win-core3.dll"];
  
    return (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2">Folders</h3>
        <div className="grid grid-cols-6 gap-4">
          {folders.map((folder, index) => (
            <div
              key={index}
              className="p-4 bg-gray-200 text-center rounded cursor-pointer hover:bg-gray-300"
            >
              📁 {folder}
            </div>
          ))}
        </div>
  
        <h3 className="text-lg font-semibold mt-6 mb-2">Files</h3>
        <div className="grid grid-cols-6 gap-4">
          {files.map((file, index) => (
            <div
              key={index}
              className="p-4 bg-white text-center border rounded shadow hover:shadow-lg cursor-pointer"
            >
              📄 {file}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default FileList;
  
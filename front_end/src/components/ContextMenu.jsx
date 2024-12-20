// components/ContextMenu.jsx
import { useEffect, useRef, useState } from 'react';

const ContextMenu = ({ x, y, onClose, children }) => {
  return (
    <div 
      className="fixed bg-white rounded-md shadow-lg border border-gray-200 py-2 z-50"
      style={{ top: y, left: x }}
    >
      {children}
    </div>
  );
};

const MenuItem = ({ icon: Icon, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </button>
  );
};

export { ContextMenu, MenuItem };
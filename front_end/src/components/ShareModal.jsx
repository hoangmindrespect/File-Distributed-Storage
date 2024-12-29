import { useState } from 'react';

const ShareModal = ({ isOpen, onClose, onShare}) => {
  const [emails, setEmails] = useState(['']);
  
  const handleAddEmail = () => {
    setEmails([...emails, '']);
  };

  const handleEmailChange = (index, value) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const handleSubmit = async () => {
    const validEmails = emails.filter(email => email.trim() !== '');
    await onShare(validEmails);
    setEmails(['']);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[500px]">
        <h2 className="text-xl font-bold mb-4">Share</h2>
        
        {emails.map((email, index) => (
          <div key={index} className="mb-3 flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(index, e.target.value)}
              placeholder="Enter email address"
              className="w-full p-2 border rounded"
            />
          </div>
        ))}

        <div className="flex justify-between mt-4">
          <button
            onClick={handleAddEmail}
            className="text-blue-600 hover:text-blue-800"
          >
            + Add another
          </button>
          <div>
            <button
              onClick={() => {setEmails(['']); onClose();}}
              className="mr-2 px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
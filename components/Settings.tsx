import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Key, Save, X } from 'lucide-react';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load API key from localStorage
    const savedKey = localStorage.getItem('gemini_api_key') || '';
    setApiKey(savedKey);
  }, [isOpen]);

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('gemini_api_key', apiKey);
    // Also update the global process.env for immediate use
    (window as any).__GEMINI_API_KEY__ = apiKey;
    setTimeout(() => {
      setIsSaving(false);
      alert('API Key đã được lưu thành công!');
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <SettingsIcon size={20} className="mr-2" /> Cài Đặt
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Key size={16} className="inline mr-1" /> Gemini API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Nhập Gemini API Key của bạn"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            API Key được lưu trữ cục bộ trên trình duyệt của bạn
          </p>
          <div className="mt-2">
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              🔑 Lấy API Key mới tại đây
            </a>
          </div>
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <div className="font-semibold text-yellow-800 mb-1">⚠️ Lưu ý về Quota:</div>
            <div className="text-yellow-700">
              Nếu gặp lỗi "quota exceeded", bạn có thể:
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Kiểm tra quota tại: <a href="https://ai.dev/usage?tab=rate-limit" target="_blank" rel="noopener noreferrer" className="underline">ai.dev/usage</a></li>
                <li>Đợi một lúc rồi thử lại (quota thường reset theo giờ/ngày)</li>
                <li>Nâng cấp gói API nếu cần sử dụng nhiều hơn</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center disabled:opacity-50"
          >
            <Save size={16} className="mr-2" /> {isSaving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
};


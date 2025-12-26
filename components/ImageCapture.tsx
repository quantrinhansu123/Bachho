import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, CheckCircle } from 'lucide-react';
import { Employee } from '../types';

// API Key hardcoded
const API_KEY = 'AIzaSyBQhDWtE1dZDBzMILrY3hVUSnfCjhmLTwA';

interface ImageCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onDataExtracted: (data: Employee[]) => void;
  existingEmployees: Employee[];
}

export const ImageCapture: React.FC<ImageCaptureProps> = ({
  isOpen,
  onClose,
  onDataExtracted,
  existingEmployees
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target?.result as string);
        setError(null);
        setSuccessMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (err) {
      setError('Không thể truy cập camera. Vui lòng cho phép quyền truy cập camera.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setImageSrc(dataUrl);
        stopCamera();
        setError(null);
        setSuccessMessage(null);
      }
    }
  };

  const callGeminiVision = async (base64Image: string, mimeType: string): Promise<string> => {
    // API URL với model gemini-2.5-flash
    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    const url = `${API_URL}?key=${API_KEY}`;

    const prompt = `Bạn hãy đọc kĩ và làm theo 100% yêu cầu sau:

Bạn là một chuyên gia OCR và phân tích dữ liệu bảng chấm công.
Hãy phân tích hình ảnh bảng chấm công này và trích xuất dữ liệu.

Hãy đọc kỹ từng dòng trong bảng và trích xuất thông tin nhân viên.

Trả về JSON với cấu trúc sau (mảng các nhân viên):
[
  {
    "code": "mã nhân viên (nếu có, không thì để trống)",
    "name": "tên nhân viên",
    "department": "phòng ban (nếu có, không thì để 'Chưa xác định')",
    "attendance": {
      "1": "giá trị ngày 1",
      "2": "giá trị ngày 2",
      ... (các ngày khác theo thứ tự)
    }
  }
]

Quy tắc đọc giá trị chấm công:
- ✓ hoặc X hoặc có ký hiệu = "1" (đi làm)
- Trống hoặc - = "" (không có dữ liệu)
- 0.5 = "0.5" (nửa ngày)
- P = "P" (phép)
- CN hoặc cuối tuần = "CN"
- Số nào thì giữ nguyên số đó

CHỈ TRẢ VỀ JSON THUẦN TÚY, KHÔNG CÓ MARKDOWN HAY TEXT KHÁC.`;

    // Tạo request body theo cấu trúc chuẩn
    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Image
              }
            }
          ]
        }
      ]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        throw new Error(`Lỗi HTTP ${response.status}: ${response.statusText}`);
      }

      const errorCode = errorData?.error?.code || response.status;
      const errorMessage = errorData?.error?.message || 'Lỗi khi xử lý ảnh';

      if (errorCode === 400 || errorMessage.toLowerCase().includes('api key not valid') || errorMessage.toLowerCase().includes('invalid')) {
        throw new Error("⚠️ API KEY KHÔNG HỢP LỆ! Vui lòng liên hệ admin.");
      }

      if (errorCode === 429 || errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('exceeded')) {
        throw new Error("⚠️ ĐÃ VƯỢT QUÁ GIỚI HẠN SỬ DỤNG API!\n\nVui lòng đợi một lúc rồi thử lại.");
      }

      throw new Error(`Lỗi ${errorCode}: ${errorMessage}`);
    }

    const data = await response.json();
    const output = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return output;
  };

  const processImage = async () => {
    if (!imageSrc) return;

    setIsProcessing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Chuyển đổi base64
      const base64 = imageSrc.includes(',') ? imageSrc.split(',')[1] : imageSrc;
      const mimeType = imageSrc.match(/data:([^;]+);/)?.[1] || 'image/jpeg';

      console.log('Đang gọi Gemini Vision API...');
      
      // Gọi Gemini API
      const responseText = await callGeminiVision(base64, mimeType);
      
      console.log('Response từ Gemini:', responseText);

      // Xử lý JSON từ response
      let jsonText = responseText.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }

      const extractedData: any[] = JSON.parse(jsonText);

      // Chuyển đổi dữ liệu thành Employee format
      const processedData: Employee[] = extractedData.map((emp, index) => {
        const existing = existingEmployees.find(e => e.code === emp.code || e.name === emp.name);

        return {
          id: existing?.id || `extracted-${Date.now()}-${index}`,
          code: emp.code || `NV${String(index + 1).padStart(3, '0')}`,
          name: emp.name || `Nhân viên ${index + 1}`,
          department: emp.department || 'Chưa xác định',
          shift: existing?.shift || '08h00 - 17h00',
          attendance: emp.attendance || {},
          password: existing?.password || '123',
          role: existing?.role || 'staff' as const
        };
      });

      if (processedData.length === 0) {
        throw new Error('Không tìm thấy dữ liệu nhân viên trong ảnh. Vui lòng thử lại với ảnh rõ hơn.');
      }

      onDataExtracted(processedData);
      setSuccessMessage(`✅ Đã trích xuất thành công ${processedData.length} nhân viên từ ảnh!`);
      
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (err: any) {
      console.error('OCR Error:', err);
      let errorMessage = err.message || 'Không thể xử lý ảnh. Vui lòng thử lại.';
      
      if (errorMessage.includes('JSON') || errorMessage.includes('Unexpected token')) {
        errorMessage = 'Không thể đọc dữ liệu từ ảnh. Vui lòng chụp lại ảnh rõ hơn hoặc thử ảnh khác.';
      }
      
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setImageSrc(null);
    setError(null);
    setSuccessMessage(null);
    setIsProcessing(false);
    setIsCapturing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Camera size={20} className="mr-2" /> Chụp Ảnh & Trích Xuất Dữ Liệu
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded flex items-center">
            <CheckCircle size={20} className="mr-2" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
            <div className="font-semibold mb-1">⚠️ Lỗi xử lý ảnh</div>
            <div className="text-sm whitespace-pre-line">{error}</div>
          </div>
        )}

        <div className="space-y-4">
          {/* Camera/Upload Options */}
          {!imageSrc && !isCapturing && (
            <div className="flex gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
              >
                <Upload size={24} className="text-blue-600" />
                <span>Tải ảnh lên</span>
              </button>
              <button
                onClick={startCamera}
                className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition"
              >
                <Camera size={24} className="text-green-600" />
                <span>Chụp ảnh</span>
              </button>
            </div>
          )}

          {/* Camera View */}
          {isCapturing && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
              />
              <div className="mt-4 flex gap-2 justify-center">
                <button
                  onClick={capturePhoto}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  <Camera size={16} />
                  Chụp
                </button>
                <button
                  onClick={stopCamera}
                  className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          {/* Image Preview */}
          {imageSrc && (
            <div>
              <img
                src={imageSrc}
                alt="Preview"
                className="w-full rounded-lg border"
              />
              <div className="mt-4 flex gap-2">
                <button
                  onClick={processImage}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Đang xử lý với AI...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>Trích Xuất Dữ Liệu</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setImageSrc(null);
                    setError(null);
                    setSuccessMessage(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  disabled={isProcessing}
                  className="px-4 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                >
                  Chọn lại
                </button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Instructions */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <div className="font-semibold mb-1">💡 Hướng dẫn:</div>
            <ul className="list-disc list-inside space-y-1">
              <li>Chụp ảnh bảng chấm công rõ ràng, đủ sáng</li>
              <li>Đảm bảo các cột ngày và tên nhân viên hiển thị đầy đủ</li>
              <li>AI sẽ tự động đọc và trích xuất dữ liệu từ ảnh</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

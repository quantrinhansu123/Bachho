import { GoogleGenAI } from "@google/genai";
import { Employee } from '../types';

// API Key hardcoded
const API_KEY = 'AIzaSyBQhDWtE1dZDBzMILrY3hVUSnfCjhmLTwA';

// Create AI client
const getAiClient = () => {
    return new GoogleGenAI({ apiKey: API_KEY });
};

// Parse error response for better error messages
const handleApiError = (error: any): never => {
    console.error("Gemini Error:", error);
    
    const errorMessage = error?.message || error?.toString() || '';
    const errorCode = error?.status || error?.code || error?.statusCode;
    const errorData = error?.response?.data || error?.data || {};
    
    // Check for invalid API key error (400)
    const isInvalidKeyError = 
        errorCode === 400 || 
        errorData?.error?.code === 400 ||
        errorMessage.toLowerCase().includes('api key not valid') ||
        errorMessage.toLowerCase().includes('invalid api key') ||
        errorMessage.toLowerCase().includes('authentication');
    
    if (isInvalidKeyError) {
        throw new Error("⚠️ API KEY KHÔNG HỢP LỆ! Vui lòng liên hệ admin.");
    }
    
    // Check for quota exceeded (429)
    const isQuotaError = 
        errorCode === 429 || 
        errorData?.error?.code === 429 ||
        errorMessage.toLowerCase().includes('quota') ||
        errorMessage.toLowerCase().includes('exceeded') ||
        errorMessage.toLowerCase().includes('resource_exhausted') ||
        errorData?.error?.status === 'RESOURCE_EXHAUSTED';
    
    if (isQuotaError) {
        throw new Error(
            "⚠️ ĐÃ VƯỢT QUÁ GIỚI HẠN SỬ DỤNG API!\n\n" +
            "Vui lòng đợi một lúc rồi thử lại."
        );
    }
    
    throw new Error(errorMessage || "Lỗi khi xử lý yêu cầu. Vui lòng thử lại.");
};

// Analyze timesheet with Gemini AI
export const analyzeTimesheet = async (employees: Employee[], month: number, year: number) => {
    const ai = getAiClient();
    
    const dataSummary = employees.map(e => ({
        name: e.name,
        dept: e.department,
        attendance: e.attendance
    }));

    const prompt = `
        Bạn là một trợ lý HR chuyên nghiệp. Hãy phân tích dữ liệu bảng chấm công tháng ${month + 1}/${year} sau đây.
        Dữ liệu (JSON): ${JSON.stringify(dataSummary)}
        
        Nhiệm vụ:
        1. Tìm ra ai đi làm đầy đủ nhất (chăm chỉ).
        2. Tìm ra ai nghỉ nhiều nhất hoặc có pattern lạ.
        3. Đưa ra một nhận xét ngắn gọn về tình hình nhân sự tháng này bằng tiếng Việt.
        4. Trả về định dạng JSON thuần túy (không markdown) với cấu trúc:
        {
            "topPerformer": string,
            "absenteeismAlert": string,
            "summary": string
        }
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (error: any) {
        return handleApiError(error);
    }
};

// Generate fake employee data with Gemini AI
export const autoFillData = async (count: number, month: number, year: number): Promise<Employee[]> => {
    const ai = getAiClient();
    const prompt = `
        Tạo dữ liệu giả lập cho ${count} nhân viên Việt Nam cho bảng chấm công tháng ${month + 1}/${year}.
        Cấu trúc JSON mong muốn cho mỗi nhân viên:
        {
            "id": "random_string",
            "code": "3 digit number",
            "name": "Full Vietnamese Name",
            "department": "Văn Phòng" hoặc "Kế Toán",
            "shift": "08h00 - 17h00",
            "attendance": { "1": "1", "2": "1", ... "day": "value" }
        }
        
        Quy tắc chấm công:
        - Thứ 7, Chủ nhật điền "CN" hoặc để trống nếu nghỉ.
        - Ngày thường điền "1" (full công) hoặc "0.5" (nửa công) hoặc "P" (phép).
        - Hãy làm cho dữ liệu trông tự nhiên (hầu hết là 1).
        
        Trả về mảng JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (error: any) {
        return handleApiError(error);
    }
};

// Test API connection
export const testApiConnection = async (): Promise<{ success: boolean; message: string }> => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Trả lời "OK" nếu bạn nhận được tin nhắn này.',
        });
        
        if (response.text) {
            return { success: true, message: 'Kết nối API thành công!' };
        }
        return { success: false, message: 'API không trả về phản hồi.' };
    } catch (error: any) {
        return { 
            success: false, 
            message: error.message || 'Không thể kết nối API.' 
        };
    }
};

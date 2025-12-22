import { GoogleGenAI } from "@google/genai";
import { Employee } from '../types';

// IMPORTANT: In a real production app, never expose keys in client code.
// Since this is a demo environment request, we assume process.env.API_KEY is available.

const getAiClient = () => {
    if (!process.env.API_KEY) {
        throw new Error("API Key not found");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeTimesheet = async (employees: Employee[], month: number, year: number) => {
    const ai = getAiClient();
    
    // Prepare a lightweight prompt payload
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
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) {
        console.error("Gemini Error:", error);
        throw error;
    }
};

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
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (error) {
        console.error("Gemini Generation Error:", error);
        return [];
    }
};
import React, { useState, useEffect } from 'react';
import { TimesheetGrid } from './components/TimesheetGrid';
import { Login } from './components/Login';
import { HRManagement } from './components/HRManagement';
import { TargetManagement } from './components/TargetManagement';
import { INITIAL_EMPLOYEES, INITIAL_TARGETS, generateMockAttendance } from './constants';
import { Employee, Target } from './types';
import { Calendar, Users, FileDown, BrainCircuit, AlertCircle, LogOut, LayoutDashboard, Shield, MapPin } from 'lucide-react';
import { analyzeTimesheet, autoFillData } from './services/geminiService';

const App: React.FC = () => {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [currentView, setCurrentView] = useState<'timesheet' | 'hr' | 'targets'>('timesheet');

  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(11); // Dec (0-indexed)
  
  // Master Data (The Database of all employees)
  const [allEmployees, setAllEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);

  // Timesheet Data (The rows currently in the grid)
  const [gridData, setGridData] = useState<Employee[]>(() => 
    INITIAL_EMPLOYEES.map(emp => generateMockAttendance(emp, 31))
  );
  
  const [targets, setTargets] = useState<Target[]>(INITIAL_TARGETS);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{topPerformer?: string, absenteeismAlert?: string, summary?: string} | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize Data
  useEffect(() => {
    // Check if API key is set, otherwise show a polite warning or degradation
    if (!process.env.API_KEY) {
        console.warn("API Key is missing. AI features will not work.");
    }
  }, []);

  const handleLogin = async (code: string, pass: string) => {
    // Authenticate against the MASTER list, not the grid data
    const user = allEmployees.find(e => e.code === code && e.password === pass);
    if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        // Default View
        setCurrentView('timesheet');
    } else {
        throw new Error("Mã nhân viên hoặc mật khẩu không đúng.");
    }
  };

  const handleLogout = () => {
      setIsLoggedIn(false);
      setCurrentUser(null);
  };

  const handleAnalyze = async () => {
    if (!process.env.API_KEY) {
        alert("Vui lòng cấu hình API Key để sử dụng tính năng AI.");
        return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
        const result = await analyzeTimesheet(gridData, month, year);
        setAnalysisResult(result);
    } catch (e) {
        setErrorMsg("Không thể phân tích dữ liệu. Vui lòng thử lại.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleSmartFill = async () => {
     if (!process.env.API_KEY) {
        alert("Vui lòng cấu hình API Key.");
        return;
    }
    setIsAnalyzing(true);
    try {
        const newEmps = await autoFillData(3, month, year);
        // Ensure new employees have default passwords
        const newEmpsWithPass = newEmps.map(e => ({...e, password: '123', role: 'staff' as const}));
        
        // Add to grid
        setGridData(prev => [...prev, ...newEmpsWithPass]);
        // Also add to master list if they don't exist (simplified logic)
        setAllEmployees(prev => [...prev, ...newEmpsWithPass]);

    } catch (e) {
        setErrorMsg("Lỗi tạo dữ liệu.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleUpdateEmployee = (updatedEmp: Employee) => {
      // Update master list
      setAllEmployees(prev => prev.map(e => e.id === updatedEmp.id ? updatedEmp : e));
      // Update grid data if they are present there
      setGridData(prev => prev.map(e => e.id === updatedEmp.id ? updatedEmp : e));
  };

  const handleUpdateTargets = (newTargets: Target[]) => {
      setTargets(newTargets);
  };

  const handleGridChange = (newData: Employee[]) => {
      setGridData(newData);
  };

  // Updated Logo URL
  const logoUrl = "https://www.appsheet.com/template/gettablefileurl?appName=Appsheet-325045268&tableName=Kho%20%E1%BA%A3nh&fileName=Kho%20%E1%BA%A3nh_Images%2Fa95c8148.%E1%BA%A2nh.072220.jpg";

  // --- RENDER LOGIN IF NOT AUTHENTICATED ---
  if (!isLoggedIn) {
      return <Login onLogin={handleLogin} />;
  }

  // --- RENDER MAIN APP ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      {/* Header */}
      <header className="bg-blue-700 text-white shadow-md p-4 sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-1 rounded-lg overflow-hidden h-12 w-12 flex items-center justify-center shadow-lg">
                <img 
                  src={logoUrl}
                  alt="Logo" 
                  className="w-full h-full object-cover"
                />
            </div>
            <div>
                <h1 className="text-xl font-bold uppercase tracking-wide">Bạch Hổ Security</h1>
                <p className="text-blue-200 text-sm">Xin chào, {currentUser?.name} ({currentUser?.role === 'admin' ? 'Quản Trị' : 'Nhân Viên'})</p>
            </div>
          </div>

          {/* Navigation & Controls */}
          <div className="flex items-center space-x-2 bg-blue-800 p-1 rounded-lg shadow-inner">
             <button 
                onClick={() => setCurrentView('timesheet')}
                className={`flex items-center px-4 py-2 rounded transition font-medium ${currentView === 'timesheet' ? 'bg-blue-600 shadow text-white' : 'hover:bg-blue-700 text-blue-200'}`}
             >
                <LayoutDashboard size={18} className="mr-2"/> Chấm Công
             </button>
             {currentUser?.role === 'admin' && (
                 <>
                     <button 
                        onClick={() => setCurrentView('targets')}
                        className={`flex items-center px-4 py-2 rounded transition font-medium ${currentView === 'targets' ? 'bg-blue-600 shadow text-white' : 'hover:bg-blue-700 text-blue-200'}`}
                     >
                        <MapPin size={18} className="mr-2"/> Mục Tiêu
                     </button>
                     <button 
                        onClick={() => setCurrentView('hr')}
                        className={`flex items-center px-4 py-2 rounded transition font-medium ${currentView === 'hr' ? 'bg-blue-600 shadow text-white' : 'hover:bg-blue-700 text-blue-200'}`}
                     >
                        <Shield size={18} className="mr-2"/> Nhân Sự
                     </button>
                 </>
             )}
          </div>
          
           <div className="flex items-center space-x-2">
                {currentView === 'timesheet' && (
                    <div className="hidden lg:flex items-center space-x-2 mr-4">
                        <select 
                            value={month} 
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            className="bg-blue-900 text-white border border-blue-600 rounded px-2 py-1 text-sm outline-none shadow-sm cursor-pointer hover:bg-blue-800 transition"
                        >
                            {Array.from({length: 12}).map((_, i) => (
                                <option key={i} value={i}>Tháng {i + 1}</option>
                            ))}
                        </select>
                        <input 
                            type="number" 
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="bg-blue-900 text-white border border-blue-600 rounded px-2 py-1 w-20 text-sm outline-none shadow-sm hover:bg-blue-800 transition"
                        />
                    </div>
                )}
                
                <button 
                   onClick={handleLogout}
                   className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-3 py-2 rounded shadow transition text-sm font-medium border border-red-500"
                   title="Đăng xuất"
                >
                   <LogOut size={16} />
                </button>
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-hidden flex flex-col max-w-[1920px] mx-auto w-full">
        
        {currentView === 'timesheet' ? (
            <>
                {/* Actions Bar for Timesheet */}
                <div className="flex justify-end mb-4 space-x-2">
                    <button 
                        onClick={handleSmartFill}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded shadow transition text-sm font-medium text-white"
                    >
                        <BrainCircuit size={16} />
                        <span>Tạo mẫu (AI)</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded shadow transition text-sm font-medium text-white">
                        <FileDown size={16} />
                        <span>Xuất Excel</span>
                    </button>
                </div>

                {/* Analysis Card */}
                {analysisResult && (
                    <div className="mb-4 bg-white border-l-4 border-purple-500 p-4 rounded shadow-sm flex flex-col md:flex-row gap-4 animate-fade-in">
                        <div className="flex-1">
                            <h3 className="font-bold text-purple-700 flex items-center mb-2">
                                <BrainCircuit size={18} className="mr-2"/> Tổng quan AI
                            </h3>
                            <p className="text-gray-700 text-sm">{analysisResult.summary}</p>
                        </div>
                        <div className="flex flex-col gap-2 text-sm border-l pl-4 border-gray-100">
                            <div className="flex items-center text-green-700">
                                <span className="font-bold mr-2">🏆 Chăm chỉ nhất:</span> {analysisResult.topPerformer}
                            </div>
                            <div className="flex items-center text-red-600">
                                <span className="font-bold mr-2">⚠️ Cần lưu ý:</span> {analysisResult.absenteeismAlert}
                            </div>
                        </div>
                        <button 
                            onClick={() => setAnalysisResult(null)}
                            className="self-start text-gray-400 hover:text-gray-600"
                        >
                            &times;
                        </button>
                    </div>
                )}

                {errorMsg && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded flex items-center">
                        <AlertCircle size={18} className="mr-2"/> {errorMsg}
                    </div>
                )}

                {/* The Grid */}
                <TimesheetGrid 
                    year={year}
                    month={month}
                    data={gridData}
                    targets={targets}
                    allEmployees={allEmployees} // Pass the Master List here
                    onDataChange={handleGridChange}
                    onAnalyze={handleAnalyze}
                    isAnalyzing={isAnalyzing}
                />
            </>
        ) : currentView === 'targets' ? (
            <TargetManagement 
                targets={targets}
                employees={allEmployees} // Use Master List for selection
                onUpdateTargets={handleUpdateTargets}
            />
        ) : (
            <HRManagement 
                employees={allEmployees} // Manage Master List
                onUpdateEmployee={handleUpdateEmployee} 
            />
        )}
        
        <div className="mt-2 text-xs text-gray-500 flex justify-between">
            <p>* Dữ liệu được lưu trữ tạm thời trên trình duyệt.</p>
            <p>Phiên bản 1.2.1 - Bạch Hổ Security</p>
        </div>
      </main>
    </div>
  );
};

export default App;
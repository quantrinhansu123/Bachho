import React, { useState, useEffect } from 'react';
import { TimesheetGrid } from './components/TimesheetGrid';
import { Login } from './components/Login';
import { HRManagement } from './components/HRManagement';
import { TargetManagement } from './components/TargetManagement';
import { Settings } from './components/Settings';
import { ImageCapture } from './components/ImageCapture';
import { INITIAL_EMPLOYEES, INITIAL_TARGETS, generateMockAttendance } from './constants';
import { Employee, Target } from './types';
import { Calendar, Users, FileDown, AlertCircle, LogOut, LayoutDashboard, Shield, MapPin, Settings as SettingsIcon, Camera } from 'lucide-react';

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
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showImageCapture, setShowImageCapture] = useState(false);

  // Initialize Data
  useEffect(() => {
    // Load API key from localStorage and set to window global
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      (window as any).__GEMINI_API_KEY__ = savedKey;
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



  const handleImageDataExtracted = (extractedEmployees: Employee[]) => {
    // Merge with existing data - update if exists, add if new
    const updatedGridData = [...gridData];
    const updatedAllEmployees = [...allEmployees];

    extractedEmployees.forEach(extracted => {
      // Check if employee exists in grid
      const existingInGrid = updatedGridData.findIndex(e => e.code === extracted.code);
      if (existingInGrid >= 0) {
        // Update existing employee in grid with new attendance data
        updatedGridData[existingInGrid] = {
          ...updatedGridData[existingInGrid],
          attendance: { ...updatedGridData[existingInGrid].attendance, ...extracted.attendance }
        };
      } else {
        // Add new employee to grid
        updatedGridData.push(extracted);
      }

      // Check if employee exists in master list
      const existingInMaster = updatedAllEmployees.findIndex(e => e.code === extracted.code);
      if (existingInMaster >= 0) {
        // Update existing employee in master list
        updatedAllEmployees[existingInMaster] = {
          ...updatedAllEmployees[existingInMaster],
          ...extracted
        };
      } else {
        // Add new employee to master list
        updatedAllEmployees.push(extracted);
      }
    });

    setGridData(updatedGridData);
    setAllEmployees(updatedAllEmployees);
  };

  const handleUpdateEmployee = (updatedEmp: Employee) => {
      // Update master list
      setAllEmployees(prev => prev.map(e => e.id === updatedEmp.id ? updatedEmp : e));
      // Update grid data if they are present there
      setGridData(prev => prev.map(e => e.id === updatedEmp.id ? updatedEmp : e));
  };

  const handleDeleteEmployee = (empId: string) => {
      // Remove from master list
      setAllEmployees(prev => prev.filter(e => e.id !== empId));
      // Remove from grid data
      setGridData(prev => prev.filter(e => e.id !== empId));
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
                   onClick={() => setShowSettings(true)}
                   className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded shadow transition text-sm font-medium"
                   title="Cài đặt"
                >
                   <SettingsIcon size={16} />
                </button>
                
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
                        onClick={() => setShowImageCapture(true)}
                        className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded shadow transition text-sm font-medium text-white"
                    >
                        <Camera size={16} />
                        <span>Chụp Ảnh & Nhập Dữ Liệu</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded shadow transition text-sm font-medium text-white">
                        <FileDown size={16} />
                        <span>Xuất Excel</span>
                    </button>
                </div>

                {errorMsg && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded">
                        <div className="flex items-center mb-2">
                            <AlertCircle size={18} className="mr-2"/> 
                            <span className="font-semibold">Lỗi xử lý</span>
                        </div>
                        <div className="text-sm">{errorMsg}</div>
                        {errorMsg.includes('quota') && (
                            <div className="mt-2 text-xs text-red-500">
                                💡 Bạn có thể kiểm tra quota tại{' '}
                                <a href="https://ai.dev/usage?tab=rate-limit" target="_blank" rel="noopener noreferrer" className="underline">
                                    đây
                                </a>
                                {' '}hoặc đợi một lúc rồi thử lại.
                            </div>
                        )}
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
                gridData={gridData}
                year={year}
                month={month}
                currentUser={currentUser}
                onUpdateEmployee={handleUpdateEmployee}
                onDeleteEmployee={handleDeleteEmployee}
            />
        )}
        
        <div className="mt-2 text-xs text-gray-500 flex justify-between">
            <p>* Dữ liệu được lưu trữ tạm thời trên trình duyệt.</p>
            <p>Phiên bản 1.2.1 - Bạch Hổ Security</p>
        </div>
      </main>

      {/* Settings Modal */}
      <Settings 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Image Capture Modal */}
      {currentView === 'timesheet' && (
        <ImageCapture
          isOpen={showImageCapture}
          onClose={() => setShowImageCapture(false)}
          onDataExtracted={handleImageDataExtracted}
          existingEmployees={allEmployees}
        />
      )}
    </div>
  );
};

export default App;
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (code: string, pass: string) => Promise<void>;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Simulate network delay for effect
      await new Promise(resolve => setTimeout(resolve, 800));
      await onLogin(code, password);
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  // Logo: Custom AppSheet URL
  const logoUrl = "https://www.appsheet.com/template/gettablefileurl?appName=Appsheet-325045268&tableName=Kho%20%E1%BA%A3nh&fileName=Kho%20%E1%BA%A3nh_Images%2Fa95c8148.%E1%BA%A2nh.072220.jpg";

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4 lg:p-0 font-[Montserrat]">
      <div className="w-full h-screen flex overflow-hidden">
        
        {/* Cột TRÁI: Hình ảnh & Thương hiệu */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
            {/* Layer 1: Background Image - Special Forces / SWAT */}
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[40s] hover:scale-110" 
                 style={{ backgroundImage: "url('https://images.unsplash.com/photo-1595590424283-b8f17842773f?q=80&w=2070&auto=format&fit=crop')" }}>
            </div>
            
            {/* Layer 2: White Tiger Overlay (Mờ ảo - Spirit Animal) */}
            <div className="absolute inset-0 pointer-events-none opacity-25 mix-blend-overlay bg-cover bg-center"
                 style={{ 
                     backgroundImage: "url('https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?q=80&w=2672&auto=format&fit=crop')",
                 }}>
            </div>
            
            {/* Layer 3: Dark Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-gray-900/60 to-blue-900/20 mix-blend-multiply"></div>

            <div className="relative z-10 w-full flex flex-col justify-between p-12 text-white">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/20 overflow-hidden">
                         <img src={logoUrl} alt="Logo Small" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xl font-bold tracking-widest text-white uppercase drop-shadow-md border-l-2 border-amber-500 pl-3">
                        Bach Ho Security
                    </span>
                </div>
                
                <div className="mb-10">
                    <div className="inline-block px-3 py-1 mb-4 border border-amber-500/50 rounded-full bg-black/40 backdrop-blur-sm text-amber-400 text-xs font-bold tracking-wider uppercase">
                        Elite Protection Services
                    </div>
                    <h1 className="text-5xl font-extrabold leading-tight mb-6 drop-shadow-2xl">
                        Bảo Vệ <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-600">
                            Chuyên Nghiệp
                        </span>
                    </h1>
                    <div className="backdrop-blur-md bg-black/40 p-6 rounded-2xl border border-white/10 max-w-lg shadow-2xl">
                        <p className="text-gray-200 text-lg leading-relaxed font-light">
                            Đội ngũ <strong className="text-white font-bold">đặc nhiệm an ninh</strong> tinh nhuệ. Sẵn sàng ứng phó mọi tình huống, đảm bảo an toàn tuyệt đối cho thân chủ và tài sản.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 font-medium tracking-wide">
                    <p>© 2025 Bach Ho Security. All rights reserved.</p>
                </div>
            </div>
        </div>

        {/* Cột PHẢI: Form đăng nhập */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-white relative overflow-hidden">
            
            {/* Styles for dynamic background blobs */}
            <style>
                {`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                `}
            </style>

            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>

            <div className="w-full max-w-md p-8 relative z-20">
                
                <div className="text-center mb-8">
                    {/* Logo Image */}
                    <div className="mb-6 inline-block transform hover:scale-105 transition-transform duration-500">
                        <div className="relative">
                            <div className="absolute inset-0 bg-amber-400 rounded-full blur opacity-40"></div>
                            <img 
                                src={logoUrl} 
                                alt="Logo Bach Ho Security" 
                                className="w-28 h-28 object-cover rounded-full relative z-10 border-4 border-white shadow-lg"
                            />
                        </div>
                    </div>
                    
                    <h2 className="text-3xl font-extrabold text-gray-900 uppercase tracking-tight">Cổng Thông Tin</h2>
                    <p className="text-sm font-semibold text-amber-600 mt-2 uppercase tracking-wide">
                        Hệ Thống Quản Lý Chấm Công Tập Trung
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg text-center flex items-center justify-center gap-2 animate-pulse">
                           <i className="fa-solid fa-circle-exclamation"></i> {error}
                        </div>
                    )}

                    {/* Input Email/Mã NV */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Mã nhân viên</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <i className="fa-solid fa-id-badge text-gray-400 group-focus-within:text-amber-600 transition-colors text-lg"></i>
                            </div>
                            <input 
                                type="text" 
                                required 
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-sm font-medium"
                                placeholder="Nhập mã số (VD: 314)..."
                            />
                        </div>
                    </div>

                    {/* Input Password */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <i className="fa-solid fa-shield-halved text-gray-400 group-focus-within:text-amber-600 transition-colors text-lg"></i>
                            </div>
                            <input 
                                type={showPassword ? "text" : "password"}
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-sm font-medium"
                                placeholder="••••••••"
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-gray-400 hover:text-amber-600 transition-colors"
                            >
                                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center cursor-pointer select-none">
                            <input type="checkbox" className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded" />
                            <span className="ml-2 text-gray-600 font-medium">Ghi nhớ tôi</span>
                        </label>
                        <a href="#" className="font-bold text-amber-600 hover:text-amber-800 hover:underline">Quên mật khẩu?</a>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className={`w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-extrabold text-white uppercase tracking-wider transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 
                            ${isLoading 
                                ? 'bg-gray-400 cursor-not-allowed opacity-75' 
                                : 'bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 shadow-gray-500/30'}`
                        }
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Đang xác thực...</span>
                            </div>
                        ) : (
                            <>
                                <span>ĐĂNG NHẬP</span>
                                <i className="fa-solid fa-arrow-right-to-bracket ml-2"></i>
                            </>
                        )}
                    </button>
                </form>

                {/* DEMO CREDENTIALS BOX */}
                <div className="mt-8 p-5 bg-gray-50 border border-gray-100 rounded-xl shadow-inner">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
                        <span className="w-8 h-[1px] bg-gray-300"></span>
                        Thông tin Demo
                        <span className="w-8 h-[1px] bg-gray-300"></span>
                    </h3>
                    <div className="flex gap-4">
                         <div className="flex-1 bg-white p-3 rounded border border-gray-200 text-center shadow-sm hover:shadow-md transition-shadow cursor-help" title="Sử dụng để đăng nhập Admin">
                            <div className="text-xs text-gray-400 mb-1">Mã NV (Admin)</div>
                            <div className="font-mono font-bold text-gray-800 text-lg">314</div>
                         </div>
                         <div className="flex-1 bg-white p-3 rounded border border-gray-200 text-center shadow-sm hover:shadow-md transition-shadow cursor-help" title="Mật khẩu mặc định">
                            <div className="text-xs text-gray-400 mb-1">Mật khẩu</div>
                            <div className="font-mono font-bold text-gray-800 text-lg">123</div>
                         </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400">
                        Phiên bản 1.3.0 &bull; Bảo mật bởi Bach Ho Tech
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
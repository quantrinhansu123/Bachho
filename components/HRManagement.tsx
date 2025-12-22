import React, { useState } from 'react';
import { Employee } from '../types';
import { User, Key, Save, Search, Shield, ShieldAlert } from 'lucide-react';

interface HRManagementProps {
  employees: Employee[];
  onUpdateEmployee: (updatedEmp: Employee) => void;
}

export const HRManagement: React.FC<HRManagementProps> = ({ employees, onUpdateEmployee }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Employee>>({});

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setEditForm({ ...emp });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (editingId && editForm) {
      // Find original to merge properly
      const original = employees.find(e => e.id === editingId);
      if (original) {
         onUpdateEmployee({ ...original, ...editForm } as Employee);
      }
      setEditingId(null);
      setEditForm({});
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold text-gray-800 flex items-center">
             <Shield className="mr-2 text-amber-600" /> Quản Lý Nhân Sự & Tài Khoản
           </h2>
           <p className="text-sm text-gray-500 mt-1">Quản lý thông tin đăng nhập và phân quyền nhân viên</p>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm nhân viên..."
            className="pl-10 pr-4 py-2 border rounded-full focus:ring-2 focus:ring-amber-500 focus:outline-none w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã NV</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ Tên</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng Ban</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quyền Hạn</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mật Khẩu</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEmployees.map((emp) => (
              <tr key={emp.id} className="hover:bg-amber-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                   {emp.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                   {editingId === emp.id ? (
                       <input 
                         className="border rounded px-2 py-1 w-full"
                         value={editForm.name || ''}
                         onChange={e => setEditForm({...editForm, name: e.target.value})}
                       />
                   ) : (
                       <div className="flex items-center">
                         <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mr-3 font-bold">
                            {emp.name.charAt(0)}
                         </div>
                         {emp.name}
                       </div>
                   )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === emp.id ? (
                       <input 
                         className="border rounded px-2 py-1 w-full"
                         value={editForm.department || ''}
                         onChange={e => setEditForm({...editForm, department: e.target.value})}
                       />
                   ) : emp.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {editingId === emp.id ? (
                        <select 
                            className="border rounded px-2 py-1"
                            value={editForm.role || 'staff'}
                            onChange={e => setEditForm({...editForm, role: e.target.value as any})}
                        >
                            <option value="staff">Nhân viên</option>
                            <option value="admin">Quản trị viên</option>
                        </select>
                    ) : (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${emp.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {emp.role === 'admin' ? 'Quản Trị' : 'Nhân Viên'}
                        </span>
                    )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {editingId === emp.id ? (
                       <div className="flex items-center">
                           <Key size={14} className="mr-1 text-gray-400"/>
                           <input 
                             className="border rounded px-2 py-1 w-24"
                             type="text"
                             value={editForm.password || ''}
                             onChange={e => setEditForm({...editForm, password: e.target.value})}
                           />
                       </div>
                   ) : '••••••'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                   {editingId === emp.id ? (
                       <div className="flex justify-end space-x-2">
                           <button onClick={saveEdit} className="text-green-600 hover:text-green-900"><Save size={18} /></button>
                           <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700">Hủy</button>
                       </div>
                   ) : (
                       <button onClick={() => startEdit(emp)} className="text-amber-600 hover:text-amber-900">Sửa</button>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredEmployees.length === 0 && (
            <div className="text-center py-10 text-gray-500">
                Không tìm thấy nhân viên nào.
            </div>
        )}
      </div>
      
      <div className="bg-amber-50 p-4 text-xs text-amber-800 border-t border-amber-100 flex items-start">
         <ShieldAlert size={16} className="mr-2 mt-0.5" />
         <div>
             <strong>Lưu ý bảo mật:</strong> Chỉ những tài khoản có quyền Quản Trị (Admin) mới có thể truy cập vào trang này. 
             Mật khẩu nhân viên nên được đặt phức tạp để đảm bảo an toàn.
         </div>
      </div>
    </div>
  );
};
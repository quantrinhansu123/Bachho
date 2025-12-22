import React, { useState } from 'react';
import { Employee, Target, RosterItem } from '../types';
import { MapPin, Users, Plus, Trash2, Save, X } from 'lucide-react';

interface TargetManagementProps {
  targets: Target[];
  employees: Employee[];
  onUpdateTargets: (newTargets: Target[]) => void;
}

// Common shift time options
const SHIFT_OPTIONS = [
  '06h00 - 14h00',
  '08h00 - 17h00',
  '14h00 - 22h00',
  '18h00 - 06h00',
  '22h00 - 06h00',
  '00h00 - 08h00',
  '12h00 - 20h00',
  '20h00 - 04h00'
];

export const TargetManagement: React.FC<TargetManagementProps> = ({ targets, employees, onUpdateTargets }) => {
  const [editingTarget, setEditingTarget] = useState<Target | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [customShiftIndexes, setCustomShiftIndexes] = useState<Set<number>>(new Set());

  // Form state
  const [formName, setFormName] = useState('');
  const [formRoster, setFormRoster] = useState<RosterItem[]>([]);

  const handleCreate = () => {
    setIsCreating(true);
    setEditingTarget(null);
    setFormName('Mục Tiêu Mới');
    setFormRoster([]);
  };

  const handleEdit = (target: Target) => {
    setIsCreating(false);
    setEditingTarget(target);
    setFormName(target.name);
    setFormRoster([...target.roster]);
    // Check for custom shifts and add to customShiftIndexes
    const customIndexes = new Set<number>();
    target.roster.forEach((item, index) => {
      if (isCustomShift(item.shift)) {
        customIndexes.add(index);
      }
    });
    setCustomShiftIndexes(customIndexes);
  };

  const handleSave = () => {
    if (!formName.trim()) return;

    const newTargetData: Target = {
      id: editingTarget ? editingTarget.id : Math.random().toString(36).substr(2, 9),
      name: formName,
      roster: formRoster
    };

    let updatedTargets;
    if (editingTarget) {
      updatedTargets = targets.map(t => t.id === editingTarget.id ? newTargetData : t);
    } else {
      updatedTargets = [...targets, newTargetData];
    }

    onUpdateTargets(updatedTargets);
    handleCancel();
  };

  const handleCancel = () => {
    setEditingTarget(null);
    setIsCreating(false);
    setFormName('');
    setFormRoster([]);
    setCustomShiftIndexes(new Set());
  };

  const handleDeleteTarget = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa mục tiêu này không?')) {
      onUpdateTargets(targets.filter(t => t.id !== id));
      if (editingTarget?.id === id) handleCancel();
    }
  };

  // Roster Management
  const addEmployeeToRoster = () => {
    setFormRoster([...formRoster, { employeeId: '', shift: '' }]);
  };

  const removeRosterItem = (index: number) => {
    setFormRoster(formRoster.filter((_, i) => i !== index));
    setCustomShiftIndexes(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      // Adjust indexes for items after the removed one
      const adjusted = new Set<number>();
      newSet.forEach(idx => {
        if (idx > index) {
          adjusted.add(idx - 1);
        } else if (idx < index) {
          adjusted.add(idx);
        }
      });
      return adjusted;
    });
  };

  const updateRosterItem = (index: number, field: keyof RosterItem, value: string) => {
    const newRoster = [...formRoster];
    newRoster[index] = { ...newRoster[index], [field]: value };
    setFormRoster(newRoster);
  };

  // Check if shift is a custom value (not in predefined options)
  const isCustomShift = (shift: string): boolean => {
    return shift !== '' && !SHIFT_OPTIONS.includes(shift);
  };


  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex">
      {/* Left Sidebar: List of Targets */}
      <div className="w-1/3 border-r flex flex-col bg-gray-50">
        <div className="p-4 border-b flex justify-between items-center bg-white">
          <h3 className="font-bold text-gray-700 flex items-center">
            <MapPin size={18} className="mr-2 text-blue-600" /> Danh Sách Mục Tiêu
          </h3>
          <button 
            onClick={handleCreate}
            className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {targets.map(target => (
            <div 
              key={target.id}
              onClick={() => handleEdit(target)}
              className={`p-4 border-b cursor-pointer hover:bg-blue-50 transition-colors ${editingTarget?.id === target.id ? 'bg-blue-100 border-l-4 border-l-blue-600' : ''}`}
            >
              <div className="font-semibold text-gray-800">{target.name}</div>
              <div className="text-xs text-gray-500 mt-1 flex items-center">
                <Users size={12} className="mr-1" /> {target.roster.length} nhân sự
              </div>
            </div>
          ))}
          {targets.length === 0 && (
            <div className="p-4 text-center text-gray-400 text-sm">Chưa có mục tiêu nào.</div>
          )}
        </div>
      </div>

      {/* Right Content: Edit Form */}
      <div className="w-2/3 flex flex-col">
        {(editingTarget || isCreating) ? (
          <div className="flex flex-col h-full">
            <div className="p-6 border-b bg-white" style={{ borderBottomWidth: '1px', borderBottomColor: 'rgba(0, 112, 192, 1)' }}>
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold text-gray-800">
                    {isCreating ? 'Thêm Mục Tiêu Mới' : 'Chỉnh Sửa Mục Tiêu'}
                 </h2>
                 <button onClick={handleDeleteTarget} disabled={isCreating} className="text-red-500 hover:bg-red-50 p-2 rounded disabled:opacity-0">
                    <Trash2 size={18} />
                 </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên Mục Tiêu / Địa Điểm</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ví dụ: Mục tiêu Kho A"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
               <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-bold text-gray-700">Danh Sách Nhân Sự & Ca Trực</label>
                  <button 
                    onClick={addEmployeeToRoster}
                    className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 flex items-center"
                  >
                    <Plus size={12} className="mr-1"/> Thêm Nhân Sự
                  </button>
               </div>
               
               <div className="space-y-2">
                 {formRoster.map((item, index) => (
                   <div key={index} className="flex gap-2 items-center bg-white p-2 rounded border shadow-sm">
                      <div className="flex-1">
                        <select 
                          value={item.employeeId}
                          onChange={(e) => updateRosterItem(index, 'employeeId', e.target.value)}
                          className="w-full p-2 border rounded text-sm"
                        >
                          <option value="">-- Chọn Nhân Sự --</option>
                          {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name} ({emp.code})</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-40">
                         {customShiftIndexes.has(index) ? (
                           <div>
                             <input 
                                type="text"
                                value={item.shift}
                                onChange={(e) => updateRosterItem(index, 'shift', e.target.value)}
                                placeholder="Nhập ca trực (VD: 08h00-17h00)"
                                className="w-full p-2 border rounded text-sm"
                                autoFocus
                             />
                             <button
                               type="button"
                               onClick={() => {
                                 setCustomShiftIndexes(prev => {
                                   const newSet = new Set(prev);
                                   newSet.delete(index);
                                   return newSet;
                                 });
                                 updateRosterItem(index, 'shift', '');
                               }}
                               className="text-xs text-gray-500 hover:text-blue-600 mt-1 w-full text-left"
                             >
                               ← Chọn từ danh sách
                             </button>
                           </div>
                         ) : (
                           <select
                              value={item.shift}
                              onChange={(e) => {
                                if (e.target.value === 'custom') {
                                  setCustomShiftIndexes(prev => new Set(prev).add(index));
                                  updateRosterItem(index, 'shift', '');
                                } else {
                                  updateRosterItem(index, 'shift', e.target.value);
                                }
                              }}
                              className="w-full p-2 border rounded text-sm"
                           >
                             <option value="">-- Chọn Ca --</option>
                             {SHIFT_OPTIONS.map((shift) => (
                               <option key={shift} value={shift}>{shift}</option>
                             ))}
                             <option value="custom">-- Tùy chỉnh --</option>
                           </select>
                         )}
                      </div>
                      <button 
                        onClick={() => removeRosterItem(index)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X size={18} />
                      </button>
                   </div>
                 ))}
                 {formRoster.length === 0 && (
                   <div className="text-sm text-gray-400 italic text-center py-4 border-2 border-dashed rounded">
                     Chưa có nhân sự nào trong mục tiêu này.
                   </div>
                 )}
               </div>
            </div>

            <div className="p-4 border-t bg-white flex justify-end space-x-2">
              <button onClick={handleCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Hủy</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center">
                <Save size={16} className="mr-2" /> Lưu Thay Đổi
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MapPin size={48} className="mb-4 text-gray-300" />
            <p>Chọn một mục tiêu để chỉnh sửa hoặc tạo mới.</p>
          </div>
        )}
      </div>
    </div>
  );
};
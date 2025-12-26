import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { Employee, DayInfo, Target } from '../types';
import { DAYS_OF_WEEK_EN } from '../constants';
import { Plus, Trash2, Copy, AlignCenterHorizontal, ChevronDown, CheckSquare, Square } from 'lucide-react';

interface TimesheetGridProps {
  year: number;
  month: number; // 0-indexed (0 = Jan, 11 = Dec)
  data: Employee[];
  targets: Target[]; // Passed from App
  allEmployees: Employee[]; // Full list to look up details
  onDataChange: (newData: Employee[]) => void;
}

interface Selection {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export const TimesheetGrid: React.FC<TimesheetGridProps> = ({
  year,
  month,
  data,
  targets,
  allEmployees,
  onDataChange
}) => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Selection State (Checkbox)
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  
  // Autocomplete state
  const [autocompleteState, setAutocompleteState] = useState<{
    activeField: string | null; // empId-field format
    suggestions: Employee[];
    searchTerm: string;
  }>({
    activeField: null,
    suggestions: [],
    searchTerm: ''
  });

  // Selection State (Drag Cell)
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTargetDropdown(false);
      }
      // Close autocomplete when clicking outside
      const target = event.target as HTMLElement;
      if (!target.closest('.autocomplete-container')) {
        setAutocompleteState(prev => ({ ...prev, activeField: null }));
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate days for the specific month
  const days = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result: DayInfo[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dayIndex = date.getDay(); // 0 = Sun, 1 = Mon...
      result.push({
        date: i,
        dayOfWeek: DAYS_OF_WEEK_EN[dayIndex],
        isWeekend: dayIndex === 0 || dayIndex === 6,
      });
    }
    return result;
  }, [year, month]);

  // Autocomplete helper functions
  const getSuggestions = (searchTerm: string, field: 'code' | 'name'): Employee[] => {
    if (!searchTerm || searchTerm.length < 1) return [];
    
    const term = searchTerm.toLowerCase().trim();
    return allEmployees.filter(emp => {
      if (field === 'code') {
        return emp.code?.toLowerCase().includes(term);
      } else {
        return emp.name?.toLowerCase().includes(term);
      }
    }).slice(0, 5); // Limit to 5 suggestions
  };

  const handleAutocompleteInput = (empId: string, field: 'code' | 'name', value: string) => {
    const suggestions = getSuggestions(value, field);
    setAutocompleteState({
      activeField: `${empId}-${field}`,
      suggestions,
      searchTerm: value
    });
    handleInfoChange(empId, field, value);
  };

  const selectSuggestion = (empId: string, field: 'code' | 'name', emp: Employee) => {
    const updates: Partial<Employee> = {};
    if (field === 'code') {
      updates.code = emp.code;
      updates.name = emp.name;
      updates.department = emp.department;
    } else {
      updates.name = emp.name;
      updates.code = emp.code;
      updates.department = emp.department;
    }
    
    const newData = data.map(e => {
      if (e.id === empId) {
        return { ...e, ...updates };
      }
      return e;
    });
    onDataChange(newData);
    
    setAutocompleteState({
      activeField: null,
      suggestions: [],
      searchTerm: ''
    });
  };

  // --- Mouse Event Handlers for Drag Selection ---

  const handleMouseDown = (rowIndex: number, colIndex: number, e: React.MouseEvent) => {
    // Only left click triggers selection
    if (e.button !== 0) return;
    
    setIsSelecting(true);
    setSelection({
      startRow: rowIndex,
      startCol: colIndex,
      endRow: rowIndex,
      endCol: colIndex,
    });
  };

  const handleMouseEnter = (rowIndex: number, colIndex: number) => {
    if (isSelecting && selection) {
      setSelection({
        ...selection,
        endRow: rowIndex,
        endCol: colIndex,
      });
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // --- Checkbox Selection Helpers ---
  const toggleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedRowIds.size === data.length && data.length > 0) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(data.map(d => d.id)));
    }
  };

  const toggleRowSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click or other events
    const newSet = new Set(selectedRowIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedRowIds(newSet);
  };

  const deleteSelectedRows = () => {
    if (selectedRowIds.size === 0) return;
    // Removing confirm dialog to improve UX and avoid blocking issues
    const remainingEmployees = data.filter(emp => !selectedRowIds.has(emp.id));
    onDataChange(remainingEmployees);
    setSelectedRowIds(new Set());
  };

  // --- Selection Helper ---
  const isCellSelected = (rowIndex: number, colIndex: number) => {
    if (!selection) return false;
    const minRow = Math.min(selection.startRow, selection.endRow);
    const maxRow = Math.max(selection.startRow, selection.endRow);
    const minCol = Math.min(selection.startCol, selection.endCol);
    const maxCol = Math.max(selection.startCol, selection.endCol);

    return rowIndex >= minRow && rowIndex <= maxRow && colIndex >= minCol && colIndex <= maxCol;
  };

  // --- Data & Clipboard Handlers ---

  const handleCellChange = (empId: string, day: number, value: string) => {
    const newData = data.map((emp) => {
      if (emp.id === empId) {
        return {
          ...emp,
          attendance: {
            ...emp.attendance,
            [day]: value,
          },
        };
      }
      return emp;
    });
    onDataChange(newData);
  };

  const handleInfoChange = (empId: string, field: keyof Employee, value: string) => {
    const newData = data.map((emp) => {
      if (emp.id === empId) {
        return { ...emp, [field]: value };
      }
      return emp;
    });
    onDataChange(newData);
  };

  const copySelection = useCallback(() => {
    if (!selection) return;
    const minRow = Math.min(selection.startRow, selection.endRow);
    const maxRow = Math.max(selection.startRow, selection.endRow);
    const minCol = Math.min(selection.startCol, selection.endCol);
    const maxCol = Math.max(selection.startCol, selection.endCol);

    let clipboardText = "";
    for (let r = minRow; r <= maxRow; r++) {
      const rowData = [];
      for (let c = minCol; c <= maxCol; c++) {
        const day = days[c].date;
        rowData.push(data[r].attendance[day] || "");
      }
      clipboardText += rowData.join("\t") + (r < maxRow ? "\n" : "");
    }
    
    navigator.clipboard.writeText(clipboardText);
  }, [selection, data, days]);

  const pasteSelection = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;
      
      const rows = text.split(/\r\n|\n|\r/);
      if (rows.length > 0 && rows[rows.length-1] === "") rows.pop();

      const startRow = selection ? Math.min(selection.startRow, selection.endRow) : 0;
      const startCol = selection ? Math.min(selection.startCol, selection.endCol) : 0;
      
      const isSingleValue = rows.length === 1 && rows[0].split("\t").length === 1;
      const isMultiSelection = selection && (selection.startRow !== selection.endRow || selection.startCol !== selection.endCol);

      let newData = [...data];

      if (isSingleValue && isMultiSelection) {
         const val = rows[0].trim();
         const minRow = Math.min(selection!.startRow, selection!.endRow);
         const maxRow = Math.max(selection!.startRow, selection!.endRow);
         const minCol = Math.min(selection!.startCol, selection!.endCol);
         const maxCol = Math.max(selection!.startCol, selection!.endCol);

         for(let r = minRow; r <= maxRow; r++) {
            if (r >= newData.length) break;
            const emp = { ...newData[r], attendance: { ...newData[r].attendance } };
            for(let c = minCol; c <= maxCol; c++) {
               const day = days[c].date;
               emp.attendance[day] = val;
            }
            newData[r] = emp;
         }
      } else {
        rows.forEach((rowStr, rIdx) => {
            const cells = rowStr.split("\t");
            const targetRowIdx = startRow + rIdx;
            
            if (targetRowIdx < newData.length) {
                const emp = { ...newData[targetRowIdx], attendance: { ...newData[targetRowIdx].attendance } };
                cells.forEach((val, cIdx) => {
                    const targetColIdx = startCol + cIdx;
                    if (targetColIdx < days.length) {
                        const day = days[targetColIdx].date;
                        emp.attendance[day] = val.trim();
                    }
                });
                newData[targetRowIdx] = emp;
            }
        });
      }

      onDataChange(newData);
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
    }
  }, [selection, data, days, onDataChange]);

  const fillSelection = () => {
    if (!selection) return;
    const minRow = Math.min(selection.startRow, selection.endRow);
    const minCol = Math.min(selection.startCol, selection.endCol);
    const sourceVal = data[minRow].attendance[days[minCol].date] || "";
    const maxRow = Math.max(selection.startRow, selection.endRow);
    const maxCol = Math.max(selection.startCol, selection.endCol);

    const newData = data.map((emp, rIdx) => {
        if (rIdx >= minRow && rIdx <= maxRow) {
            const newAttendance = { ...emp.attendance };
            for (let c = minCol; c <= maxCol; c++) {
                const day = days[c].date;
                newAttendance[day] = sourceVal;
            }
            return { ...emp, attendance: newAttendance };
        }
        return emp;
    });
    
    onDataChange(newData);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
         if (selection) {
            e.preventDefault();
            copySelection();
         }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
         if (selection) {
             pasteSelection();
         }
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
          if (selection) {
              const minRow = Math.min(selection.startRow, selection.endRow);
              const maxRow = Math.max(selection.startRow, selection.endRow);
              const minCol = Math.min(selection.startCol, selection.endCol);
              const maxCol = Math.max(selection.startCol, selection.endCol);
              
              const newData = data.map((emp, rIdx) => {
                  if (rIdx >= minRow && rIdx <= maxRow) {
                      const newAtt = {...emp.attendance};
                      for(let c=minCol; c<=maxCol; c++) {
                          const day = days[c].date;
                          newAtt[day] = "";
                      }
                      return {...emp, attendance: newAtt};
                  }
                  return emp;
              });
              onDataChange(newData);
          }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selection, copySelection, pasteSelection, data, days]);

  const calculateTotal = (attendance: Record<number, string>) => {
    let total = 0;
    Object.values(attendance).forEach((val) => {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        total += num;
      }
    });
    return total;
  };

  const getCellColor = (val: string, isWeekend: boolean) => {
    if (val === 'CN' || val === 'Red') return 'bg-red-600 text-white font-bold';
    if (val === '0.5') return 'bg-blue-100 text-blue-800';
    if (val === '1') return isWeekend ? 'bg-yellow-200' : 'bg-green-100'; 
    if (val === 'P') return 'bg-orange-200';
    if (!val && isWeekend) return 'bg-yellow-50';
    return 'bg-white';
  };

  const addNewRow = () => {
     const newId = Math.random().toString(36).substr(2, 9);
     const newEmp: Employee = {
         id: newId,
         code: '', // Start empty to encourage entering a code
         name: '',
         department: 'Văn Phòng',
         shift: '', // No longer used but kept for type compatibility
         attendance: {}
     };
     onDataChange([...data, newEmp]);
     setShowTargetDropdown(false);
  };

  const addTargetRows = (target: Target) => {
    const newRows: Employee[] = [];
    let duplicateCount = 0;

    target.roster.forEach(rosterItem => {
        // Look up against allEmployees (Master List)
        const empDetails = allEmployees.find(e => e.id === rosterItem.employeeId);
        
        if (empDetails) {
            // DUPLICATE CHECK: Check if an employee with this CODE already exists in the GRID data
            const isAlreadyInGrid = data.some(d => d.code === empDetails.code);
            
            if (!isAlreadyInGrid) {
                const rowId = Math.random().toString(36).substr(2, 9);
                newRows.push({
                    id: rowId,
                    code: empDetails.code,
                    name: empDetails.name,
                    department: target.name, 
                    shift: '', // No longer used but kept for type compatibility
                    attendance: {}, 
                    password: '', 
                    role: 'staff'
                });
            } else {
                duplicateCount++;
            }
        }
    });

    if (newRows.length === 0) {
        if (duplicateCount > 0) {
             // More descriptive alert
             alert(`Không thể thêm: Tất cả ${duplicateCount} nhân sự trong mục tiêu "${target.name}" đã có mặt trong bảng chấm công.`);
        } else {
             alert(`Mục tiêu "${target.name}" chưa có nhân sự nào được gán trong phần Quản Lý Mục Tiêu.`);
        }
        setShowTargetDropdown(false);
        return;
    }

    onDataChange([...data, ...newRows]);
    setShowTargetDropdown(false);
  };

  const removeRow = (id: string) => {
      onDataChange(data.filter(e => e.id !== id));
  };

  // Sort data by Target order
  const sortedData = useMemo(() => {
    // Create a map: employeeCode -> { targetIndex, rosterIndex }
    // We use code because it's consistent even when new rows are added
    const employeeTargetMap = new Map<string, { targetIndex: number; rosterIndex: number }>();
    
    targets.forEach((target, targetIndex) => {
      target.roster.forEach((rosterItem, rosterIndex) => {
        // Find employee by ID in allEmployees to get their code
        const emp = allEmployees.find(e => e.id === rosterItem.employeeId);
        if (emp && emp.code) {
          employeeTargetMap.set(emp.code, {
            targetIndex,
            rosterIndex
          });
        }
      });
    });

    // Sort data
    const sorted = [...data].sort((a, b) => {
      // Get target info for each employee by their code
      const targetInfoA = a.code ? employeeTargetMap.get(a.code) : undefined;
      const targetInfoB = b.code ? employeeTargetMap.get(b.code) : undefined;

      // Both employees are in targets
      if (targetInfoA && targetInfoB) {
        // Different targets - sort by target order
        if (targetInfoA.targetIndex !== targetInfoB.targetIndex) {
          return targetInfoA.targetIndex - targetInfoB.targetIndex;
        }
        // Same target - sort by roster order
        return targetInfoA.rosterIndex - targetInfoB.rosterIndex;
      }

      // Only A is in a target
      if (targetInfoA) return -1;
      
      // Only B is in a target
      if (targetInfoB) return 1;
      
      // Neither is in a target - sort by name alphabetically
      return (a.name || '').localeCompare(b.name || '', 'vi');
    });

    return sorted;
  }, [data, targets, allEmployees]);

  // Sticky Positioning Constants
  const COL_WIDTHS = {
      CHECK: 40,
      STT: 40,
      CODE: 70,
      NAME: 180,
      TARGET: 150
  };
  
  const POS_CHECK = 0;
  const POS_STT = COL_WIDTHS.CHECK;
  const POS_CODE = POS_STT + COL_WIDTHS.STT;
  const POS_NAME = POS_CODE + COL_WIDTHS.CODE;
  const POS_TARGET = POS_NAME + COL_WIDTHS.NAME;

  return (
    <div className="flex flex-col h-full bg-gray-100 border rounded-lg shadow-xl overflow-hidden select-none">
      {/* Toolbar */}
      <div className="flex justify-between items-center p-2 bg-white border-b">
        <div className="flex items-center space-x-2">
            <span className="font-bold text-gray-700">Tổng Số: {data.reduce((acc, curr) => acc + calculateTotal(curr.attendance), 0)} công</span>
            
            {selectedRowIds.size > 0 && (
                <button 
                    type="button"
                    onClick={deleteSelectedRows}
                    className="flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition ml-4 border border-red-200"
                >
                    <Trash2 size={14} className="mr-1" /> Xóa {selectedRowIds.size} dòng đã chọn
                </button>
            )}

            {selection && (
                <div className="flex items-center space-x-1 ml-4 pl-4 border-l">
                    <button onClick={copySelection} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded flex items-center" title="Ctrl+C">
                        <Copy size={12} className="mr-1"/> Copy
                    </button>
                    <button onClick={fillSelection} className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded flex items-center" title="Lấy giá trị ô đầu tiên điền cho cả vùng chọn">
                        <AlignCenterHorizontal size={12} className="mr-1"/> Fill Pattern
                    </button>
                </div>
            )}
        </div>
        <div className="flex space-x-2">
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setShowTargetDropdown(!showTargetDropdown)}
                    className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                    <Plus size={16} className="mr-1" /> Thêm NV <ChevronDown size={14} className="ml-1"/>
                </button>
                
                {showTargetDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50 border ring-1 ring-black ring-opacity-5 py-1">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b uppercase">
                            Thêm từ Mục Tiêu
                        </div>
                        {targets.map(t => (
                            <button
                                key={t.id}
                                onClick={() => addTargetRows(t)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                            >
                                {t.name} <span className="text-xs text-gray-400">({t.roster.length} NV)</span>
                            </button>
                        ))}
                        <div className="border-t my-1"></div>
                        <button
                             onClick={addNewRow}
                             className="block w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 italic"
                        >
                            + Thêm dòng trống
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Table Container - Horizontal Scroll */}
      <div className="flex-1 overflow-auto relative bg-white" ref={tableRef}>
        <table className="border-collapse w-full min-w-max text-sm">
          <thead className="sticky top-0 z-20">
            {/* Header Row 1: Dates */}
            <tr className="bg-[#0070c0] text-white">
              <th className="sticky z-30 border border-gray-400 bg-[#0070c0] p-1 text-center cursor-pointer select-none"
                  style={{left: POS_CHECK, width: COL_WIDTHS.CHECK}}
                  onClick={toggleSelectAll}
              >
                  <div className="w-full h-full flex items-center justify-center">
                    {data.length > 0 && selectedRowIds.size === data.length ? <CheckSquare size={16} /> : <Square size={16} />}
                  </div>
              </th>
              <th className="sticky z-30 border border-gray-400 bg-[#0070c0] p-1" style={{left: POS_STT, width: COL_WIDTHS.STT}}>STT</th>
              <th className="sticky z-30 border border-gray-400 bg-[#0070c0] p-1" style={{left: POS_CODE, width: COL_WIDTHS.CODE}}>Mã</th>
              <th className="sticky z-30 border border-gray-400 bg-[#0070c0] p-1" style={{left: POS_NAME, width: COL_WIDTHS.NAME}}>Họ Và Tên</th>
              <th className="sticky z-30 border border-gray-400 bg-[#0070c0] p-1" style={{left: POS_TARGET, width: COL_WIDTHS.TARGET}}>Mục Tiêu</th>
              {days.map((day) => (
                <th
                  key={`date-${day.date}`}
                  className={`w-10 border border-gray-400 p-1 text-center font-normal ${
                    day.isWeekend ? 'bg-[#0070c0]' : 'bg-[#0070c0]'
                  }`}
                >
                  {day.date.toString().padStart(2, '0')}
                </th>
              ))}
              <th className="w-16 border border-gray-400 bg-[#0070c0] p-1">Tổng</th>
              <th className="w-10 border border-gray-400 bg-[#0070c0] p-1">Xóa</th>
            </tr>
            {/* Header Row 2: Days of Week */}
            <tr className="bg-[#ffc000] text-black">
              <th className="sticky z-30 border border-gray-400 bg-[#0070c0] h-6" style={{left: POS_CHECK}}></th>
              <th className="sticky z-30 border border-gray-400 bg-[#0070c0] h-6" style={{left: POS_STT}}></th>
              <th className="sticky z-30 border border-gray-400 bg-[#0070c0] h-6" style={{left: POS_CODE}}></th>
              <th className="sticky z-30 border border-gray-400 bg-[#0070c0] h-6" style={{left: POS_NAME}}></th>
              <th className="sticky z-30 border border-gray-400 bg-[#0070c0] h-6" style={{left: POS_TARGET}}></th>
              {days.map((day) => (
                <th
                  key={`day-${day.date}`}
                  className={`border border-gray-400 p-0 text-center text-xs font-semibold h-6 ${
                    day.isWeekend ? 'bg-yellow-400' : 'bg-[#0070c0] text-white'
                  }`}
                >
                  {day.dayOfWeek}
                </th>
              ))}
              <th className="border border-gray-400 bg-[#0070c0] h-6"></th>
              <th className="border border-gray-400 bg-[#0070c0] h-6"></th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((emp, rIdx) => {
              const codeFieldKey = `${emp.id}-code`;
              const nameFieldKey = `${emp.id}-name`;
              const isCodeActive = autocompleteState.activeField === codeFieldKey;
              const isNameActive = autocompleteState.activeField === nameFieldKey;
              
              return (
                <tr
                  key={emp.id}
                  className={`group ${hoveredRow === emp.id ? 'bg-blue-50' : 'bg-white'}`}
                  onMouseEnter={() => setHoveredRow(emp.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                {/* Fixed Columns */}
                <td className="sticky z-10 border border-gray-300 bg-white p-0 text-center cursor-pointer select-none"
                    style={{left: POS_CHECK}}
                    onClick={(e) => toggleRowSelection(emp.id, e)}
                >
                    <div className="w-full h-full flex items-center justify-center hover:bg-blue-100">
                        {selectedRowIds.has(emp.id) ? 
                            <CheckSquare size={16} className="text-blue-600"/> : 
                            <Square size={16} className="text-gray-300 group-hover:text-gray-400"/>
                        }
                    </div>
                </td>
                <td className="sticky z-10 border border-gray-300 bg-white p-1 text-center font-medium text-gray-500"
                    style={{left: POS_STT}}
                >
                  {rIdx + 1}
                </td>
                <td className="sticky z-10 border border-gray-300 bg-white p-0 relative" style={{left: POS_CODE}}>
                   <div className="relative autocomplete-container">
                     <input 
                        type="text" 
                        value={emp.code} 
                        onChange={(e) => handleAutocompleteInput(emp.id, 'code', e.target.value)}
                        onFocus={() => {
                          const suggestions = getSuggestions(emp.code, 'code');
                          setAutocompleteState({
                            activeField: codeFieldKey,
                            suggestions,
                            searchTerm: emp.code
                          });
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            setAutocompleteState(prev => prev.activeField === codeFieldKey ? { ...prev, activeField: null } : prev);
                          }, 200);
                        }}
                        className="w-full h-full px-1 text-center focus:outline-none focus:bg-blue-50 bg-transparent font-semibold text-gray-700"
                     />
                     {isCodeActive && autocompleteState.suggestions.length > 0 && (
                       <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded shadow-lg mt-1 max-h-40 overflow-y-auto autocomplete-container">
                         {autocompleteState.suggestions.map((suggestion) => (
                           <div
                             key={suggestion.id}
                             onMouseDown={(e) => e.preventDefault()}
                             onClick={() => selectSuggestion(emp.id, 'code', suggestion)}
                             className="px-2 py-1 hover:bg-blue-50 cursor-pointer text-sm"
                           >
                             <div className="font-semibold">{suggestion.code}</div>
                             <div className="text-xs text-gray-500">{suggestion.name}</div>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                </td>
                <td className="sticky z-10 border border-gray-300 bg-white p-0 relative" style={{left: POS_NAME}}>
                  <div className="relative autocomplete-container">
                    <input
                      type="text"
                      value={emp.name}
                      onChange={(e) => handleAutocompleteInput(emp.id, 'name', e.target.value)}
                      onFocus={() => {
                        const suggestions = getSuggestions(emp.name, 'name');
                        setAutocompleteState({
                          activeField: nameFieldKey,
                          suggestions,
                          searchTerm: emp.name
                        });
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          setAutocompleteState(prev => prev.activeField === nameFieldKey ? { ...prev, activeField: null } : prev);
                        }, 200);
                      }}
                      className="w-full h-full px-2 py-1 font-semibold text-gray-800 focus:outline-none focus:bg-blue-50 bg-transparent truncate"
                    />
                    {isNameActive && autocompleteState.suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded shadow-lg mt-1 max-h-40 overflow-y-auto autocomplete-container">
                        {autocompleteState.suggestions.map((suggestion) => (
                          <div
                            key={suggestion.id}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => selectSuggestion(emp.id, 'name', suggestion)}
                            className="px-2 py-1 hover:bg-blue-50 cursor-pointer text-sm"
                          >
                            <div className="font-semibold">{suggestion.name}</div>
                            <div className="text-xs text-gray-500">Mã: {suggestion.code} - {suggestion.department}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="sticky z-10 border border-gray-300 p-0 bg-yellow-200" style={{left: POS_TARGET}}>
                    <input
                      type="text"
                      value={emp.department} // Used as Target Name
                      onChange={(e) => handleInfoChange(emp.id, 'department', e.target.value)}
                      className="w-full h-full bg-transparent px-1 font-medium focus:outline-none truncate"
                    />
                </td>

                {/* Day Cells */}
                {days.map((day, cIdx) => {
                  const val = emp.attendance[day.date] || '';
                  const isSelected = isCellSelected(rIdx, cIdx);
                  
                  return (
                    <td
                      key={`${emp.id}-${day.date}`}
                      onMouseDown={(e) => handleMouseDown(rIdx, cIdx, e)}
                      onMouseEnter={() => handleMouseEnter(rIdx, cIdx)}
                      className={`border border-gray-300 p-0 text-center h-8 min-w-[32px] cursor-cell relative 
                        ${getCellColor(val, day.isWeekend)} 
                        ${isSelected ? 'ring-2 ring-blue-500 ring-inset z-10' : ''}
                      `}
                    >
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleCellChange(emp.id, day.date, e.target.value)}
                        className={`w-full h-full text-center bg-transparent focus:outline-none font-bold ${
                            val === 'CN' ? 'text-white' : ''
                        } ${isSelected ? 'bg-blue-500 bg-opacity-20 text-blue-900' : ''}`}
                        onDragStart={(e) => e.preventDefault()} 
                      />
                    </td>
                  );
                })}

                {/* Totals */}
                <td className="border border-gray-300 bg-[#00b050] text-white font-bold text-center p-1">
                  {calculateTotal(emp.attendance)}
                </td>
                <td className="border border-gray-300 text-center p-0">
                    <button 
                        onClick={() => removeRow(emp.id)}
                        className="w-full h-full flex items-center justify-center text-red-500 hover:bg-red-50"
                    >
                        <Trash2 size={14}/>
                    </button>
                </td>
                </tr>
              );
            })}
            
            <tr className="h-4"></tr>
          </tbody>
        </table>
      </div>
      
    </div>
  );
};
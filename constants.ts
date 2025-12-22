import { Employee, Target } from './types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: '1',
    code: '314',
    name: 'Trần Hữu Liên Việt',
    department: 'Văn Phòng',
    shift: '08h00 - 17h00',
    attendance: {},
    password: '123',
    role: 'admin'
  },
  {
    id: '2',
    code: '111',
    name: 'Trần Xuân Đức',
    department: 'Văn Phòng',
    shift: '08h00 - 17h00',
    attendance: {},
    password: '123',
    role: 'staff'
  },
  {
    id: '3',
    code: '473',
    name: 'Nguyễn Quốc Pháp',
    department: 'Kho A',
    shift: '06h00 - 14h00',
    attendance: {},
    password: '123',
    role: 'staff'
  },
  {
    id: '4',
    code: '347',
    name: 'Lê Anh Tuấn',
    department: 'Kho A',
    shift: '14h00 - 22h00',
    attendance: {},
    password: '123',
    role: 'staff'
  },
  {
    id: '5',
    code: '222',
    name: 'Võ Đức Liêm',
    department: 'Kho B',
    shift: '06h00 - 18h00',
    attendance: {},
    password: '123',
    role: 'staff'
  },
  {
    id: '6',
    code: '333',
    name: 'Nguyễn Hà Trang',
    department: 'Văn Phòng',
    shift: '08h00 - 17h00',
    attendance: {},
    password: '123',
    role: 'staff'
  },
  {
    id: '7',
    code: '444',
    name: 'Lê Duy Hợi',
    department: 'Kho B',
    shift: '18h00 - 06h00',
    attendance: {},
    password: '123',
    role: 'staff'
  },
  {
    id: '8',
    code: '555',
    name: 'Phạm Thị Thùy Linh',
    department: 'Kế Toán',
    shift: '08h00 - 17h00',
    attendance: {},
    password: '123',
    role: 'admin'
  }
];

export const INITIAL_TARGETS: Target[] = [
  {
    id: 't1',
    name: 'Văn Phòng Chính',
    roster: [
      { employeeId: '1', shift: '08h00 - 17h00' }, // Việt
      { employeeId: '2', shift: '08h00 - 17h00' }, // Đức
      { employeeId: '6', shift: '08h00 - 17h00' }, // Trang
    ]
  },
  {
    id: 't2',
    name: 'Mục Tiêu Kho A',
    roster: [
      { employeeId: '3', shift: '06h00 - 14h00' }, // Pháp
      { employeeId: '4', shift: '14h00 - 22h00' }, // Tuấn
    ]
  },
  {
    id: 't3',
    name: 'Mục Tiêu Kho B',
    roster: [
      { employeeId: '5', shift: '06h00 - 18h00' }, // Liêm
      { employeeId: '7', shift: '18h00 - 06h00' }, // Hợi
    ]
  }
];

export const DAYS_OF_WEEK_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
export const DAYS_OF_WEEK_EN = ['Sun', 'Mo', 'Tue', 'We', 'Thu', 'Fri', 'Sat'];

// Pre-fill some random data for demo purposes if needed
export const generateMockAttendance = (emp: Employee, daysInMonth: number) => {
  const attendance: Record<number, string> = {};
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(2025, 11, i); // Dec 2025
    const day = date.getDay();
    if (day === 0) {
      attendance[i] = 'CN';
    } else {
      attendance[i] = Math.random() > 0.1 ? '1' : Math.random() > 0.5 ? '0.5' : 'P';
    }
  }
  return { ...emp, attendance };
};
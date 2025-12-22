export interface Employee {
  id: string;
  code: string;
  name: string;
  department: string; // Used as "Mục Tiêu" in the grid context often
  shift: string; // "Thời Gian"
  attendance: Record<number, string>; // Day number -> value
  password?: string; // For login
  role?: 'admin' | 'staff'; // For permissions
}

export interface DayInfo {
  date: number;
  dayOfWeek: string;
  isWeekend: boolean;
}

export type CellValue = string;

export interface RosterItem {
  employeeId: string;
  shift: string;
}

export interface Target {
  id: string;
  name: string;
  roster: RosterItem[];
}

export interface AppState {
  month: number;
  year: number;
  employees: Employee[];
}
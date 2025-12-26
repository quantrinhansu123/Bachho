import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase configuration
const firebaseConfig = {
  databaseURL: 'https://bachho-2062a-default-rtdb.asia-southeast1.firebasedatabase.app/'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Read JSON data
const jsonPath = path.join(__dirname, '..', 'firebase-database-structure.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

async function importData() {
  console.log('🚀 Bắt đầu import dữ liệu vào Firebase...\n');

  try {
    // Import employees
    console.log('📝 Đang import employees...');
    for (const [key, employee] of Object.entries(jsonData.employees)) {
      await set(ref(database, `employees/${key}`), employee);
      console.log(`  ✓ Đã thêm nhân viên: ${employee.name} (${employee.code})`);
    }

    // Import targets
    console.log('\n📝 Đang import targets...');
    for (const [key, target] of Object.entries(jsonData.targets)) {
      await set(ref(database, `targets/${key}`), target);
      console.log(`  ✓ Đã thêm mục tiêu: ${target.name}`);
    }

    // Import timesheets
    console.log('\n📝 Đang import timesheets...');
    for (const [year, yearData] of Object.entries(jsonData.timesheets)) {
      for (const [month, monthData] of Object.entries(yearData)) {
        for (const [employeeId, timesheet] of Object.entries(monthData)) {
          await set(ref(database, `timesheets/${year}/${month}/${employeeId}`), timesheet);
          console.log(`  ✓ Đã thêm chấm công: ${timesheet.name} - ${month}/${year}`);
        }
      }
    }

    // Import workflows
    if (jsonData.workflows) {
      console.log('\n📝 Đang import workflows...');
      for (const [key, workflow] of Object.entries(jsonData.workflows)) {
        await set(ref(database, `workflows/${key}`), workflow);
        console.log(`  ✓ Đã thêm workflow: ${workflow.name}`);
      }
    }

    console.log('\n✅ Hoàn thành! Tất cả dữ liệu đã được import vào Firebase.');
    console.log('\n🔗 Kiểm tra tại: https://console.firebase.google.com/project/bachho-2062a/database/bachho-2062a-default-rtdb/data/');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Lỗi khi import dữ liệu:', error);
    process.exit(1);
  }
}

// Run import
importData();





/**
 * Comprehensive API End-to-End Testing Script
 * Tests all API endpoints and logs errors
 */

const API_BASE_URL = 'http://localhost:3400';

// Helper function to make HTTP requests
async function apiRequest(method, path, data = null, token = null) {
  const url = `${API_BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    let responseData;

    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    return {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      data: responseData,
    };
  } catch (error) {
    return {
      status: 0,
      statusText: 'Network Error',
      ok: false,
      error: error.message,
    };
  }
}

// Logging utilities
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
};

function logTest(endpoint, method, status, message, details = null) {
  results.total++;
  const timestamp = new Date().toISOString();
  const testResult = {
    timestamp,
    endpoint,
    method,
    status,
    message,
    details,
  };

  if (status === 'PASS') {
    results.passed++;
    console.log(`✓ [${method}] ${endpoint} - ${message}`);
  } else if (status === 'FAIL') {
    results.failed++;
    results.errors.push(testResult);
    console.error(`✗ [${method}] ${endpoint} - ${message}`);
    if (details) {
      console.error(`  Details:`, details);
    }
  } else {
    console.log(`ℹ [${method}] ${endpoint} - ${message}`);
  }
}

// Test data
let tokens = {
  admin: null,
  teacher: null,
  student: null,
};

let testData = {
  adminId: null,
  teacherId: null,
  studentId: null,
  courseId: null,
  gameId: null,
  classCode: null,
};

async function runTests() {
  console.log('='.repeat(80));
  console.log('Starting Comprehensive API End-to-End Tests');
  console.log('='.repeat(80));
  console.log('');

  // ========== ROOT ENDPOINT ==========
  console.log('\n📍 ROOT ENDPOINT');
  console.log('-'.repeat(80));

  try {
    const response = await apiRequest('GET', '/');
    if (response.ok) {
      logTest('/', 'GET', 'PASS', `Health check successful (${response.status})`);
    } else {
      logTest('/', 'GET', 'FAIL', `Health check failed (${response.status})`, response.data);
    }
  } catch (error) {
    logTest('/', 'GET', 'FAIL', 'Health check error', error.message);
  }

  // ========== AUTHENTICATION MODULE ==========
  console.log('\n🔐 AUTHENTICATION MODULE');
  console.log('-'.repeat(80));

  // Test admin login
  try {
    const response = await apiRequest('POST', '/api/auth/login', {
      email: 'admin@ecoblox.build',
      password: 'admin123',
      role: 'admin',
    });

    if (response.ok && response.data.access_token) {
      tokens.admin = response.data.access_token;
      logTest('/api/auth/login', 'POST', 'PASS', 'Admin login successful');
    } else {
      logTest('/api/auth/login', 'POST', 'FAIL', `Admin login failed (${response.status})`, response.data);
    }
  } catch (error) {
    logTest('/api/auth/login', 'POST', 'FAIL', 'Admin login error', error.message);
  }

  // Test teacher login - try to find or create a teacher first
  try {
    const response = await apiRequest('POST', '/api/auth/login', {
      email: 'teacher@robloxacademy.com',
      password: 'teacher123',
      role: 'teacher',
    });

    if (response.ok && response.data.access_token) {
      tokens.teacher = response.data.access_token;
      logTest('/api/auth/login', 'POST', 'PASS', 'Teacher login successful');
    } else {
      logTest('/api/auth/login', 'POST', 'INFO', `Teacher login failed - might need to create teacher first (${response.status})`);
    }
  } catch (error) {
    logTest('/api/auth/login', 'POST', 'FAIL', 'Teacher login error', error.message);
  }

  // Test student login
  try {
    const response = await apiRequest('POST', '/api/auth/student-login', {
      email: 'lovejsson@gmail.com',
      pin: '0000',
    });

    if (response.ok && response.data.access_token) {
      tokens.student = response.data.access_token;
      logTest('/api/auth/student-login', 'POST', 'PASS', 'Student login successful');
    } else {
      logTest('/api/auth/student-login', 'POST', 'INFO', `Student login failed - might need to create student first (${response.status})`);
    }
  } catch (error) {
    logTest('/api/auth/student-login', 'POST', 'FAIL', 'Student login error', error.message);
  }

  // Test invalid login
  try {
    const response = await apiRequest('POST', '/api/auth/login', {
      email: 'invalid@test.com',
      password: 'wrongpassword',
    });

    if (!response.ok) {
      logTest('/api/auth/login', 'POST', 'PASS', 'Invalid login correctly rejected');
    } else {
      logTest('/api/auth/login', 'POST', 'FAIL', 'Invalid login was accepted (security issue!)', response.data);
    }
  } catch (error) {
    logTest('/api/auth/login', 'POST', 'FAIL', 'Invalid login test error', error.message);
  }

  // ========== ADMIN MODULE ==========
  console.log('\n👑 ADMIN MODULE');
  console.log('-'.repeat(80));

  if (!tokens.admin) {
    console.log('⚠ Skipping admin tests - no admin token available');
  } else {
    // Get all students
    try {
      const response = await apiRequest('GET', '/admin/students', null, tokens.admin);
      if (response.ok) {
        const students = response.data.students || [];
        logTest('/admin/students', 'GET', 'PASS', `Retrieved ${students.length} students`);
        if (students.length > 0) {
          testData.studentId = students[0].id;
        }
      } else {
        logTest('/admin/students', 'GET', 'FAIL', `Failed to get students (${response.status})`, response.data);
      }
    } catch (error) {
      logTest('/admin/students', 'GET', 'FAIL', 'Get students error', error.message);
    }

    // Get all teachers
    try {
      const response = await apiRequest('GET', '/admin/teachers', null, tokens.admin);
      if (response.ok) {
        const teachers = response.data.teachers || [];
        logTest('/admin/teachers', 'GET', 'PASS', `Retrieved ${teachers.length} teachers`);
        if (teachers.length > 0) {
          testData.teacherId = teachers[0].id;
        }
      } else {
        logTest('/admin/teachers', 'GET', 'FAIL', `Failed to get teachers (${response.status})`, response.data);
      }
    } catch (error) {
      logTest('/admin/teachers', 'GET', 'FAIL', 'Get teachers error', error.message);
    }

    // Get admin stats
    try {
      const response = await apiRequest('GET', '/admin/stats', null, tokens.admin);
      if (response.ok) {
        logTest('/admin/stats', 'GET', 'PASS', `Retrieved admin stats: ${JSON.stringify(response.data.stats || response.data)}`);
      } else {
        logTest('/admin/stats', 'GET', 'FAIL', `Failed to get admin stats (${response.status})`, response.data);
      }
    } catch (error) {
      logTest('/admin/stats', 'GET', 'FAIL', 'Get admin stats error', error.message);
    }

    // Get all games
    try {
      const response = await apiRequest('GET', '/admin/games', null, tokens.admin);
      if (response.ok) {
        const games = Array.isArray(response.data) ? response.data : [];
        logTest('/admin/games', 'GET', 'PASS', `Retrieved ${games.length} games`);
        if (games.length > 0) {
          testData.gameId = games[0].id;
        }
      } else {
        logTest('/admin/games', 'GET', 'FAIL', `Failed to get games (${response.status})`, response.data);
      }
    } catch (error) {
      logTest('/admin/games', 'GET', 'FAIL', 'Get games error', error.message);
    }

    // Test getting specific student
    if (testData.studentId) {
      try {
        const response = await apiRequest('GET', `/admin/students/${testData.studentId}`, null, tokens.admin);
        if (response.ok) {
          logTest(`/admin/students/${testData.studentId}`, 'GET', 'PASS', 'Retrieved specific student');
        } else {
          logTest(`/admin/students/${testData.studentId}`, 'GET', 'FAIL', `Failed to get student (${response.status})`, response.data);
        }
      } catch (error) {
        logTest(`/admin/students/${testData.studentId}`, 'GET', 'FAIL', 'Get specific student error', error.message);
      }
    }

    // Test getting specific teacher
    if (testData.teacherId) {
      try {
        const response = await apiRequest('GET', `/admin/teachers/${testData.teacherId}`, null, tokens.admin);
        if (response.ok) {
          logTest(`/admin/teachers/${testData.teacherId}`, 'GET', 'PASS', 'Retrieved specific teacher');
        } else {
          logTest(`/admin/teachers/${testData.teacherId}`, 'GET', 'FAIL', `Failed to get teacher (${response.status})`, response.data);
        }
      } catch (error) {
        logTest(`/admin/teachers/${testData.teacherId}`, 'GET', 'FAIL', 'Get specific teacher error', error.message);
      }
    }

    // Test game students endpoint
    if (testData.gameId) {
      try {
        const response = await apiRequest('GET', `/admin/games/${testData.gameId}/students`, null, tokens.admin);
        if (response.ok) {
          const students = Array.isArray(response.data) ? response.data : [];
          logTest(`/admin/games/${testData.gameId}/students`, 'GET', 'PASS', `Retrieved ${students.length} students for game`);
        } else {
          logTest(`/admin/games/${testData.gameId}/students`, 'GET', 'FAIL', `Failed to get game students (${response.status})`, response.data);
        }
      } catch (error) {
        logTest(`/admin/games/${testData.gameId}/students`, 'GET', 'FAIL', 'Get game students error', error.message);
      }
    }

    // Test creating a teacher
    try {
      const newTeacher = {
        name: 'Test Teacher API',
        email: `teacher.api.test.${Date.now()}@test.com`,
        password: 'test123',
      };
      const response = await apiRequest('POST', '/admin/teachers', newTeacher, tokens.admin);
      if (response.ok || response.status === 201) {
        logTest('/admin/teachers', 'POST', 'PASS', 'Created test teacher successfully');
        const createdTeacherId = response.data.id;

        // Clean up - delete the test teacher
        if (createdTeacherId) {
          const deleteResponse = await apiRequest('DELETE', `/admin/teachers/${createdTeacherId}`, null, tokens.admin);
          if (deleteResponse.ok) {
            logTest(`/admin/teachers/${createdTeacherId}`, 'DELETE', 'PASS', 'Deleted test teacher successfully');
          }
        }
      } else {
        logTest('/admin/teachers', 'POST', 'FAIL', `Failed to create teacher (${response.status})`, response.data);
      }
    } catch (error) {
      logTest('/admin/teachers', 'POST', 'FAIL', 'Create teacher error', error.message);
    }
  }

  // ========== TEACHER MODULE ==========
  console.log('\n👨‍🏫 TEACHER MODULE');
  console.log('-'.repeat(80));

  if (!tokens.teacher && !tokens.admin) {
    console.log('⚠ Skipping teacher tests - no teacher or admin token available');
  } else {
    const teacherToken = tokens.teacher || tokens.admin;

    // Get teacher students (singular endpoint)
    try {
      const response = await apiRequest('GET', '/api/teacher/students', null, teacherToken);
      if (response.ok) {
        const students = response.data.students || [];
        logTest('/api/teacher/students', 'GET', 'PASS', `Retrieved ${students.length} teacher students`);
      } else {
        logTest('/api/teacher/students', 'GET', 'FAIL', `Failed to get teacher students (${response.status})`, response.data);
      }
    } catch (error) {
      logTest('/api/teacher/students', 'GET', 'FAIL', 'Get teacher students error', error.message);
    }

    // Get teacher students (plural endpoint)
    try {
      const response = await apiRequest('GET', '/api/teachers/students', null, teacherToken);
      if (response.ok) {
        const students = response.data.students || [];
        logTest('/api/teachers/students', 'GET', 'PASS', `Retrieved ${students.length} teacher students (plural endpoint)`);
      } else {
        logTest('/api/teachers/students', 'GET', 'FAIL', `Failed to get teacher students (${response.status})`, response.data);
      }
    } catch (error) {
      logTest('/api/teachers/students', 'GET', 'FAIL', 'Get teacher students error (plural)', error.message);
    }

    // Get teacher stats (singular)
    try {
      const response = await apiRequest('GET', '/api/teacher/stats', null, teacherToken);
      if (response.ok) {
        logTest('/api/teacher/stats', 'GET', 'PASS', `Retrieved teacher stats`);
      } else {
        logTest('/api/teacher/stats', 'GET', 'FAIL', `Failed to get teacher stats (${response.status})`, response.data);
      }
    } catch (error) {
      logTest('/api/teacher/stats', 'GET', 'FAIL', 'Get teacher stats error', error.message);
    }

    // Get teacher stats (plural)
    try {
      const response = await apiRequest('GET', '/api/teachers/stats', null, teacherToken);
      if (response.ok) {
        logTest('/api/teachers/stats', 'GET', 'PASS', `Retrieved teacher stats (plural endpoint)`);
      } else {
        logTest('/api/teachers/stats', 'GET', 'FAIL', `Failed to get teacher stats (${response.status})`, response.data);
      }
    } catch (error) {
      logTest('/api/teachers/stats', 'GET', 'FAIL', 'Get teacher stats error (plural)', error.message);
    }

    // Get teacher dashboard
    try {
      const response = await apiRequest('GET', '/api/teacher/dashboard', null, teacherToken);
      if (response.ok) {
        logTest('/api/teacher/dashboard', 'GET', 'PASS', `Retrieved teacher dashboard`);
      } else {
        logTest('/api/teacher/dashboard', 'GET', 'FAIL', `Failed to get teacher dashboard (${response.status})`, response.data);
      }
    } catch (error) {
      logTest('/api/teacher/dashboard', 'GET', 'FAIL', 'Get teacher dashboard error', error.message);
    }

    // Get teacher class codes
    try {
      const response = await apiRequest('GET', '/api/teacher/class-codes', null, teacherToken);
      if (response.ok) {
        const classCodes = Array.isArray(response.data) ? response.data : [];
        logTest('/api/teacher/class-codes', 'GET', 'PASS', `Retrieved ${classCodes.length} class codes`);
        if (classCodes.length > 0) {
          testData.classCode = classCodes[0].code;
        }
      } else {
        logTest('/api/teacher/class-codes', 'GET', 'FAIL', `Failed to get class codes (${response.status})`, response.data);
      }
    } catch (error) {
      logTest('/api/teacher/class-codes', 'GET', 'FAIL', 'Get class codes error', error.message);
    }

    // Test student progress endpoint
    if (testData.studentId) {
      try {
        const response = await apiRequest('GET', `/api/teacher/students/${testData.studentId}/progress`, null, teacherToken);
        if (response.ok) {
          logTest(`/api/teacher/students/${testData.studentId}/progress`, 'GET', 'PASS', 'Retrieved student progress');
        } else {
          logTest(`/api/teacher/students/${testData.studentId}/progress`, 'GET', 'FAIL', `Failed to get student progress (${response.status})`, response.data);
        }
      } catch (error) {
        logTest(`/api/teacher/students/${testData.studentId}/progress`, 'GET', 'FAIL', 'Get student progress error', error.message);
      }
    }
  }

  // ========== COURSES MODULE ==========
  console.log('\n📚 COURSES MODULE');
  console.log('-'.repeat(80));

  const courseToken = tokens.student || tokens.teacher || tokens.admin;
  if (!courseToken) {
    console.log('⚠ Skipping courses tests - no authentication token available');
  } else {
    // Get all courses
    try {
      const response = await apiRequest('GET', '/api/courses', null, courseToken);
      if (response.ok) {
        const courses = Array.isArray(response.data) ? response.data : [];
        logTest('/api/courses', 'GET', 'PASS', `Retrieved ${courses.length} courses`);
        if (courses.length > 0) {
          testData.courseId = courses[0].id;
        }
      } else {
        logTest('/api/courses', 'GET', 'FAIL', `Failed to get courses (${response.status})`, response.data);
      }
    } catch (error) {
      logTest('/api/courses', 'GET', 'FAIL', 'Get courses error', error.message);
    }

    // Get specific course
    if (testData.courseId) {
      try {
        const response = await apiRequest('GET', `/api/courses/${testData.courseId}`, null, courseToken);
        if (response.ok) {
          logTest(`/api/courses/${testData.courseId}`, 'GET', 'PASS', 'Retrieved specific course');
        } else {
          logTest(`/api/courses/${testData.courseId}`, 'GET', 'FAIL', `Failed to get course (${response.status})`, response.data);
        }
      } catch (error) {
        logTest(`/api/courses/${testData.courseId}`, 'GET', 'FAIL', 'Get specific course error', error.message);
      }
    }
  }

  // ========== PROGRESS MODULE ==========
  console.log('\n📈 PROGRESS MODULE');
  console.log('-'.repeat(80));

  // Test getting student progress (no auth required)
  if (testData.studentId) {
    try {
      const response = await apiRequest('GET', `/api/progress/student/${testData.studentId}`);
      if (response.ok) {
        logTest(`/api/progress/student/${testData.studentId}`, 'GET', 'PASS', 'Retrieved overall student progress');
      } else {
        logTest(`/api/progress/student/${testData.studentId}`, 'GET', 'FAIL', `Failed to get student progress (${response.status})`, response.data);
      }
    } catch (error) {
      logTest(`/api/progress/student/${testData.studentId}`, 'GET', 'FAIL', 'Get student progress error', error.message);
    }

    // Test getting course-specific progress
    if (testData.courseId) {
      try {
        const response = await apiRequest('GET', `/api/progress/student/${testData.studentId}/course/${testData.courseId}`);
        if (response.ok) {
          logTest(`/api/progress/student/${testData.studentId}/course/${testData.courseId}`, 'GET', 'PASS', 'Retrieved course progress');
        } else {
          logTest(`/api/progress/student/${testData.studentId}/course/${testData.courseId}`, 'GET', 'FAIL', `Failed to get course progress (${response.status})`, response.data);
        }
      } catch (error) {
        logTest(`/api/progress/student/${testData.studentId}/course/${testData.courseId}`, 'GET', 'FAIL', 'Get course progress error', error.message);
      }
    }
  }

  // Test leaderboard endpoint
  if (testData.classCode) {
    try {
      const response = await apiRequest('GET', `/api/progress/leaderboard/${testData.classCode}`);
      if (response.ok) {
        const leaderboard = Array.isArray(response.data) ? response.data : [];
        logTest(`/api/progress/leaderboard/${testData.classCode}`, 'GET', 'PASS', `Retrieved leaderboard with ${leaderboard.length} entries`);
      } else {
        logTest(`/api/progress/leaderboard/${testData.classCode}`, 'GET', 'FAIL', `Failed to get leaderboard (${response.status})`, response.data);
      }
    } catch (error) {
      logTest(`/api/progress/leaderboard/${testData.classCode}`, 'GET', 'FAIL', 'Get leaderboard error', error.message);
    }
  }

  // ========== SUMMARY ==========
  console.log('\n' + '='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${results.total}`);
  console.log(`Passed: ${results.passed} ✓`);
  console.log(`Failed: ${results.failed} ✗`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(2)}%`);
  console.log('='.repeat(80));

  if (results.errors.length > 0) {
    console.log('\n🔴 ERRORS DETECTED:');
    console.log('='.repeat(80));
    results.errors.forEach((error, index) => {
      console.log(`\n${index + 1}. [${error.method}] ${error.endpoint}`);
      console.log(`   Timestamp: ${error.timestamp}`);
      console.log(`   Message: ${error.message}`);
      if (error.details) {
        console.log(`   Details:`, JSON.stringify(error.details, null, 2));
      }
    });
  }

  // Write results to log file
  const fs = require('fs');
  const logFileName = `api-test-results-${new Date().toISOString().replace(/:/g, '-')}.json`;
  fs.writeFileSync(
    logFileName,
    JSON.stringify(
      {
        summary: {
          total: results.total,
          passed: results.passed,
          failed: results.failed,
          successRate: `${((results.passed / results.total) * 100).toFixed(2)}%`,
          timestamp: new Date().toISOString(),
        },
        errors: results.errors,
        testData,
        tokens: {
          admin: tokens.admin ? '***' : null,
          teacher: tokens.teacher ? '***' : null,
          student: tokens.student ? '***' : null,
        },
      },
      null,
      2
    )
  );
  console.log(`\n📄 Detailed results written to: ${logFileName}`);
}

// Run the tests
runTests().catch(console.error);

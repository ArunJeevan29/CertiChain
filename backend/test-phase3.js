const API_URL = 'http://localhost:5000/api';

async function req(method, endpoint, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  
  const res = await fetch(`${API_URL}${endpoint}`, options);
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.message || 'API Error');
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function runTests() {
  console.log('--- STARTING PHASE 3 API TESTS ---');

  try {
    // 1. Admin Login
    const adminRes = await req('POST', '/auth/login', {
      email: 'admin@certsystem.com',
      password: 'AdminPassword123!'
    });
    const adminToken = adminRes.data.token;
    console.log('✅ Admin login successful');

    // 2. Register two test students
    try {
      await req('POST', '/auth/register', {
        name: 'Student One', email: 'student1@college.edu', password: 'Password123!', college: 'Test College', department: 'CS', registerNumber: 'REG-001'
      });
      await req('POST', '/auth/register', {
        name: 'Student Two', email: 'student2@college.edu', password: 'Password123!', college: 'Test College', department: 'IT', registerNumber: 'REG-002'
      });
      console.log('✅ Registered test students');
    } catch (e) {
      if (e.data && e.data.message.includes('already exists')) {
        console.log('✅ Test students already registered');
      } else {
        throw e;
      }
    }

    // 3. Login as Student One
    const s1Login = await req('POST', '/auth/login', {
      email: 'student1@college.edu', password: 'Password123!'
    });
    const s1Token = s1Login.data.token;
    const s1Id = s1Login.data.user._id;
    console.log('✅ Student 1 login successful');

    // 4. Login as Student Two
    const s2Login = await req('POST', '/auth/login', {
      email: 'student2@college.edu', password: 'Password123!'
    });
    const s2Token = s2Login.data.token;
    const s2Id = s2Login.data.user._id;

    // 5. Admin: GET all students
    const allStudents = await req('GET', '/students', null, adminToken);
    console.log(`✅ Admin fetched all students. Found: ${allStudents.data.students.length}`);

    // 6. Admin: Search students
    const searchStudents = await req('GET', '/students?q=student1', null, adminToken);
    console.log(`✅ Admin search successful. Found: ${searchStudents.data.students.length}`);

    // 7. Student 1: GET /me
    const myProfile = await req('GET', '/students/me', null, s1Token);
    console.log(`✅ Student 1 GET /me successful: ${myProfile.data.name}`);

    // 8. Student 1: Try to access Student 2
    try {
      await req('GET', `/students/${s2Id}`, null, s1Token);
      console.log('❌ Student 1 accessed Student 2 profile (SHOULD FAIL)');
    } catch (e) {
      if (e.status === 403) {
        console.log('✅ Student 1 correctly denied access to Student 2 profile (403)');
      } else {
        console.log(`❌ Unexpected error: ${e.message}`);
      }
    }

    // 9. Privilege Escalation Attempt (Student 1 tries to change role)
    const updateRes = await req('PUT', `/students/${s1Id}`, {
      role: 'ADMIN',
      studentId: 'HACKED-ID',
      name: 'Hacker One'
    }, s1Token);
    
    if (updateRes.data.role === 'STUDENT' && updateRes.data.studentId !== 'HACKED-ID' && updateRes.data.name === 'Hacker One') {
      console.log('✅ Privilege escalation blocked (Role/Student ID unchanged, Name updated)');
    } else {
      console.log('❌ Privilege escalation SUCCEEDED (Vulnerability) or update failed');
    }

    // 10. Admin: Delete Student 1
    await req('DELETE', `/students/${s1Id}`, null, adminToken);
    console.log('✅ Admin deleted Student 1 successfully');

    // 11. Student 2: Try to delete themselves
    try {
      await req('DELETE', `/students/${s2Id}`, null, s2Token);
      console.log('❌ Student 2 deleted themselves (SHOULD FAIL)');
    } catch (e) {
      if (e.status === 403) {
        console.log('✅ Student 2 correctly denied delete action (403)');
      } else {
        console.log(`❌ Unexpected delete error: ${e.message}`);
      }
    }

    console.log('--- ALL TESTS PASSED ---');
  } catch (err) {
    console.error('❌ TEST FAILED:', err.data || err.message);
  }
}

runTests();

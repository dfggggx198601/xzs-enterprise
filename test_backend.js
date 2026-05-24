const axios = require('axios');

async function test() {
  try {
    const loginRes = await axios.post('http://150.230.123.72:8000/api/student/user/login', {
      userName: 'student',
      password: '123'
    });
    
    if (loginRes.data.code !== 1) {
      console.log('Login failed', loginRes.data);
      return;
    }
    const token = loginRes.data.response;
    console.log('Login successful');
    
    const listRes = await axios.post('http://150.230.123.72:8000/api/student/agent/list', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('List Agents:', JSON.stringify(listRes.data, null, 2));
  } catch(e) {
    console.error('Error:', e.message);
    if(e.response) {
      console.error(e.response.data);
    }
  }
}

test();

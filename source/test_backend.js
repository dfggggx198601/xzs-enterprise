const axios = require('axios');

async function test() {
  try {
    const loginRes = await axios.post('http://150.230.123.72:8000/api/user/login', {
      userName: 'aa',
      password: '123456'
    });
    
    if (loginRes.data.code !== 1) {
      console.log('Login failed', loginRes.data);
      return;
    }
    const cookies = loginRes.headers['set-cookie'];
    console.log('Login successful', cookies[0]);
    
    // We try dashboard which does NOT use user_id from path/body usually (but it works)
    const dashRes = await axios.post('http://150.230.123.72:8000/api/student/dashboard/index', {}, {
      headers: { "Cookie": cookies[0] }
    });
    console.log('Dashboard Data:', dashRes.data.code === 1 ? 'OK' : dashRes.data);

    // We try agent list which uses getCurrentUser().getId() in backend mapped to user_id
    const listRes = await axios.post('http://150.230.123.72:8000/api/student/agent/list', {}, {
      headers: { "Cookie": cookies[0] }
    });
    console.log('List Agents length:', listRes.data.response ? listRes.data.response.length : listRes.data);

  } catch(e) {
    if(e.response) {
      console.error(e.response.data);
    }
  }
}

test();

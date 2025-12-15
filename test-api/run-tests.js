const API_URL = 'http://localhost:3000/api/auth';

async function runTests() {
  console.log('🚀 Démarrage des tests Auth Service via Gateway...');

  // 1. Test Health
  try {
    console.log('\n📡 Test Health Check...');
    const healthRes = await fetch(`${API_URL}/health`);
    console.log('Status:', healthRes.status);
    const healthData = await healthRes.json();
    console.log('Response:', healthData);
  } catch (error) {
    console.error('❌ Health Check Failed:', error.message);
  }

  // 2. Test Register
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    role: 'participant'
  };

  let token = '';

  try {
    console.log('\n📝 Test Register...');
    const registerRes = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    console.log('Status:', registerRes.status);
    const registerData = await registerRes.json();
    console.log('Response:', registerData);
  } catch (error) {
    console.error('❌ Register Failed:', error.message);
  }

  // 3. Test Login
  try {
    console.log('\n🔑 Test Login...');
    const loginRes = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    console.log('Status:', loginRes.status);
    const loginData = await loginRes.json();
    console.log('Response:', loginData);
    
    if (loginData.access_token) {
      token = loginData.access_token;
      console.log('✅ Token received');
    }
  } catch (error) {
    console.error('❌ Login Failed:', error.message);
  }

  // 4. Test Profile (Protected)
  if (token) {
    try {
      console.log('\n👤 Test Profile (Protected)...');
      const profileRes = await fetch(`${API_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Status:', profileRes.status);
      const profileData = await profileRes.json();
      console.log('Response:', profileData);
    } catch (error) {
      console.error('❌ Profile Check Failed:', error.message);
    }
  } else {
    console.log('\n⚠️ Skipping Profile test (no token)');
  }
}

runTests();

import fetch from 'node-fetch';

// Test register endpoint
const testRegister = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
      }),
    });
    
    const data = await response.json();
    console.log('Register response:', data);
    return data;
  } catch (error) {
    console.error('Register error:', error);
  }
};

// Test login endpoint
const testLogin = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123',
      }),
    });
    
    const data = await response.json();
    console.log('Login response:', data);
    return data;
  } catch (error) {
    console.error('Login error:', error);
  }
};

// Run tests
const runTests = async () => {
  console.log('Testing API endpoints...');
  await testRegister();
  await testLogin();
  console.log('Tests completed');
};

runTests();

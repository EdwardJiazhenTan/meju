const API_BASE = "http://localhost:3000/api";

async function testAuthEndpoints() {
  console.log("🧪 Testing Authentication Endpoints\n");

  try {
    // Test 1: User Registration
    console.log("1️⃣ Testing User Registration...");
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "testuser2",
        email: "test2@example.com",
        password: "TestPassword123",
        displayName: "Test User 2"
      })
    });

    const registerData = await registerResponse.json();
    console.log("Registration Status:", registerResponse.status);
    console.log("Registration Response:", JSON.stringify(registerData, null, 2));
    
    const token = registerData.token;
    console.log("✅ Registration test completed\n");

    // Test 2: User Login
    console.log("2️⃣ Testing User Login...");
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test2@example.com",
        password: "TestPassword123"
      })
    });

    const loginData = await loginResponse.json();
    console.log("Login Status:", loginResponse.status);
    console.log("Login Response:", JSON.stringify(loginData, null, 2));
    console.log("✅ Login test completed\n");

    // Test 3: Protected Route (Get User Details)
    if (token) {
      console.log("3️⃣ Testing Protected Route...");
      const meResponse = await fetch(`${API_BASE}/auth/me`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json" 
        }
      });

      const meData = await meResponse.json();
      console.log("Protected Route Status:", meResponse.status);
      console.log("Protected Route Response:", JSON.stringify(meData, null, 2));
      console.log("✅ Protected route test completed\n");
    }

    // Test 4: Invalid Login
    console.log("4️⃣ Testing Invalid Login...");
    const invalidLoginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test2@example.com",
        password: "wrongpassword"
      })
    });

    const invalidLoginData = await invalidLoginResponse.json();
    console.log("Invalid Login Status:", invalidLoginResponse.status);
    console.log("Invalid Login Response:", JSON.stringify(invalidLoginData, null, 2));
    console.log("✅ Invalid login test completed\n");

    console.log("🎉 All authentication tests completed!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAuthEndpoints();
}

export default testAuthEndpoints;
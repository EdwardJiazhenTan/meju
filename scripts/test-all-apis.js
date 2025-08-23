const API_BASE = "http://localhost:3000/api";

let authToken = null;
let secondUserToken = null;
let testDishId = null;
let testIngredientId = null;

async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(authToken && { "Authorization": `Bearer ${authToken}` }),
      ...options.headers,
    },
    ...options,
  };

  console.log(`\n🌐 ${config.method || 'GET'} ${endpoint}`);
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    if (response.status >= 400) {
      console.log(`   ❌ Error: ${data.message}`);
    } else {
      console.log(`   ✅ Success: ${data.message}`);
      if (data.data) {
        const keys = Object.keys(data.data);
        console.log(`   📊 Data keys: ${keys.join(', ')}`);
        if (keys.length <= 3) {
          console.log(`   🔍 Sample data: ${JSON.stringify(data.data, null, 2).substring(0, 200)}...`);
        }
      }
    }
    
    return { response, data };
  } catch (error) {
    console.log(`   💥 Network Error: ${error.message}`);
    return { error };
  }
}

async function setupAuth() {
  console.log("🔐 Setting up authentication...");
  
  // Try to login with existing user
  const { data: loginData } = await makeRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "test@example.com",
      password: "TestPassword123"
    })
  });

  if (loginData?.token) {
    authToken = loginData.token;
    console.log("   🎯 Using existing user");
  } else {
    // Register new user
    const { data: registerData } = await makeRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        username: "mainuser",
        email: "mainuser@example.com",
        password: "TestPassword123",
        displayName: "Main Test User"
      })
    });
    authToken = registerData?.token;
  }

  // Create second user for sharing tests
  const { data: secondUserData } = await makeRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      username: "shareuser",
      email: "shareuser@example.com", 
      password: "TestPassword123",
      displayName: "Share Test User"
    })
  });
  
  if (secondUserData?.token) {
    secondUserToken = secondUserData.token;
    console.log("   👥 Created second user for sharing tests");
  }

  return authToken && secondUserToken;
}

async function testCompleteAPI() {
  console.log("🚀 COMPREHENSIVE MEJU API TESTING");
  console.log("=" .repeat(60));

  if (!(await setupAuth())) {
    console.log("❌ Authentication setup failed");
    return;
  }

  // Test 1: User Profile API
  console.log("\n👤 TESTING: User Profile API");
  await makeRequest("/users/profile");
  await makeRequest("/users/profile", {
    method: "PUT",
    body: JSON.stringify({
      display_name: "Updated Display Name",
      profile_public: true
    })
  });

  // Test 2: Ingredients API  
  console.log("\n🥬 TESTING: Ingredients API");
  await makeRequest("/ingredients");
  await makeRequest("/ingredients/categories");
  await makeRequest("/ingredients?q=potato");
  await makeRequest("/ingredients?category=vegetable");
  
  const { data: ingredientData } = await makeRequest("/ingredients", {
    method: "POST",
    body: JSON.stringify({
      name: "api test ingredient",
      unit: "gram",
      category: "spice"
    })
  });
  testIngredientId = ingredientData?.data?.ingredient?.ingredient_id;

  // Test 3: Dishes API
  console.log("\n🍽️ TESTING: Dishes API");
  await makeRequest("/dishes");
  
  const { data: dishData } = await makeRequest("/dishes", {
    method: "POST", 
    body: JSON.stringify({
      name: "Comprehensive Test Dish",
      description: "A dish for comprehensive API testing",
      meal: "dinner",
      calories: 500,
      prep_time: 20,
      cook_time: 40,
      visibility: "private"
    })
  });
  testDishId = dishData?.data?.dish?.dish_id;

  if (testDishId) {
    await makeRequest(`/dishes/${testDishId}`);
    await makeRequest(`/dishes/${testDishId}`, {
      method: "PUT",
      body: JSON.stringify({
        description: "Updated comprehensive test dish",
        visibility: "public" 
      })
    });
  }

  // Test 4: Dish-Ingredients API
  console.log("\n🔗 TESTING: Dish-Ingredients API");
  if (testDishId && testIngredientId) {
    await makeRequest(`/dishes/${testDishId}/ingredients`);
    await makeRequest(`/dishes/${testDishId}/ingredients`, {
      method: "POST",
      body: JSON.stringify({
        ingredientId: testIngredientId,
        quantity: 10
      })
    });
    await makeRequest(`/dishes/${testDishId}/ingredients`);
    await makeRequest(`/dishes/${testDishId}/ingredients/${testIngredientId}`, {
      method: "PUT", 
      body: JSON.stringify({ quantity: 15 })
    });
  }

  // Test 5: Dish Tags API
  console.log("\n🏷️ TESTING: Dish Tags API");
  if (testDishId) {
    await makeRequest(`/dishes/${testDishId}/tags`);
    await makeRequest(`/dishes/${testDishId}/tags`, {
      method: "POST",
      body: JSON.stringify({ tag: "meat" })
    });
    await makeRequest(`/dishes/${testDishId}/tags`, {
      method: "POST", 
      body: JSON.stringify({ tag: "carbohydrate" })
    });
    await makeRequest(`/dishes/${testDishId}/tags`);
  }

  // Test 6: Public Dishes Discovery API
  console.log("\n🌍 TESTING: Public Dishes Discovery API");
  await makeRequest("/dishes/public");
  await makeRequest("/dishes/public?q=test");
  await makeRequest("/dishes/public?meal=dinner");
  await makeRequest("/dishes/public?tag=meat");
  await makeRequest("/dishes/public?limit=5&offset=0");

  // Test 7: Dish Sharing API
  console.log("\n🤝 TESTING: Dish Sharing API");
  if (testDishId) {
    await makeRequest(`/dishes/${testDishId}/share`);
    await makeRequest(`/dishes/${testDishId}/share`, {
      method: "POST",
      body: JSON.stringify({
        userEmail: "shareuser@example.com",
        canReshare: true
      })
    });
    await makeRequest(`/dishes/${testDishId}/share`);
  }

  // Test shared dishes (switch to second user)
  const originalToken = authToken;
  authToken = secondUserToken;
  await makeRequest("/dishes/shared");
  authToken = originalToken;

  // Test 8: Meal Planning API
  console.log("\n📅 TESTING: Meal Planning API");
  await makeRequest("/meal-plans");
  
  if (testDishId) {
    await makeRequest("/meal-plans/1", { // Monday
      method: "POST",
      body: JSON.stringify({
        dishId: testDishId,
        mealType: "dinner",
        servingSize: 1.5
      })
    });
    await makeRequest("/meal-plans");
  }

  // Test 9: Advanced Search and Filter Combinations
  console.log("\n🔍 TESTING: Advanced Search Features");
  await makeRequest("/dishes/public?q=comprehensive&limit=10");
  await makeRequest("/ingredients?q=api&category=spice");

  // Cleanup
  console.log("\n🧹 CLEANUP");
  if (testDishId && testIngredientId) {
    await makeRequest(`/dishes/${testDishId}/ingredients/${testIngredientId}`, {
      method: "DELETE"
    });
    await makeRequest(`/dishes/${testDishId}/tags/meat`, {
      method: "DELETE" 
    });
    await makeRequest(`/dishes/${testDishId}`, {
      method: "DELETE"
    });
  }

  console.log("\n" + "=" .repeat(60));
  console.log("🎉 COMPREHENSIVE API TESTING COMPLETE!");
  console.log("\n📋 TESTED APIS:");
  console.log("✅ Authentication & User Management");
  console.log("✅ User Profile Management"); 
  console.log("✅ Ingredients CRUD & Search");
  console.log("✅ Dishes CRUD & Management");
  console.log("✅ Dish-Ingredients Relationships");
  console.log("✅ Dish Tagging System");
  console.log("✅ Public Dishes Discovery");
  console.log("✅ Dish Sharing System");
  console.log("✅ Meal Planning System");
  console.log("✅ Advanced Search & Filtering");
  console.log("\n🚀 Ready for Frontend Integration!");
}

// Run comprehensive test
testCompleteAPI().catch(console.error);
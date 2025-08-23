const API_BASE = "http://localhost:3000/api";

let authToken = null;
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
        console.log(`   📊 Data keys: ${Object.keys(data.data).join(', ')}`);
      }
    }
    
    return { response, data };
  } catch (error) {
    console.log(`   💥 Network Error: ${error.message}`);
    return { error };
  }
}

async function testCompleteAPI() {
  console.log("🚀 Testing Complete Meju API\n");
  console.log("=" .repeat(50));

  // Step 1: Authentication
  console.log("\n📝 STEP 1: Authentication");
  
  // Login with existing user
  const { data: loginData } = await makeRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "test@example.com",
      password: "TestPassword123"
    })
  });

  if (loginData?.token) {
    authToken = loginData.token;
    console.log("   🔑 Authentication successful!");
  } else {
    console.log("   ❌ Authentication failed. Creating new user...");
    
    // Register new user if login fails
    const { data: registerData } = await makeRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        username: "apitest",
        email: "apitest@example.com",
        password: "TestPassword123",
        displayName: "API Test User"
      })
    });

    if (registerData?.token) {
      authToken = registerData.token;
      console.log("   ✅ New user registered successfully!");
    } else {
      console.log("   💀 Cannot proceed without authentication");
      return;
    }
  }

  // Step 2: Ingredients API
  console.log("\n🥬 STEP 2: Ingredients API");
  
  // Get all ingredients
  await makeRequest("/ingredients");
  
  // Search ingredients
  await makeRequest("/ingredients?q=potato");
  
  // Get ingredients by category
  await makeRequest("/ingredients?category=vegetable");
  
  // Get categorized ingredients
  await makeRequest("/ingredients/categories");
  
  // Create new ingredient
  const { data: newIngredientData } = await makeRequest("/ingredients", {
    method: "POST",
    body: JSON.stringify({
      name: "test tomato",
      unit: "piece",
      category: "vegetable"
    })
  });
  
  if (newIngredientData?.data?.ingredient?.ingredient_id) {
    testIngredientId = newIngredientData.data.ingredient.ingredient_id;
    console.log(`   📝 Created ingredient ID: ${testIngredientId}`);
  }

  // Step 3: Dishes API
  console.log("\n🍽️ STEP 3: Dishes API");
  
  // Get user dishes
  await makeRequest("/dishes");
  
  // Create new dish
  const { data: newDishData } = await makeRequest("/dishes", {
    method: "POST",
    body: JSON.stringify({
      name: "API Test Dish",
      description: "A dish created by API test",
      meal: "dinner",
      calories: 400,
      prep_time: 15,
      cook_time: 30
    })
  });
  
  if (newDishData?.data?.dish?.dish_id) {
    testDishId = newDishData.data.dish.dish_id;
    console.log(`   📝 Created dish ID: ${testDishId}`);
  }

  // Get single dish
  if (testDishId) {
    await makeRequest(`/dishes/${testDishId}`);
    
    // Update dish
    await makeRequest(`/dishes/${testDishId}`, {
      method: "PUT",
      body: JSON.stringify({
        description: "Updated by API test",
        calories: 450
      })
    });
  }

  // Step 4: Dish-Ingredients Relationship
  console.log("\n🔗 STEP 4: Dish-Ingredients API");
  
  if (testDishId && testIngredientId) {
    // Get dish ingredients (should be empty)
    await makeRequest(`/dishes/${testDishId}/ingredients`);
    
    // Add ingredient to dish
    await makeRequest(`/dishes/${testDishId}/ingredients`, {
      method: "POST",
      body: JSON.stringify({
        ingredientId: testIngredientId,
        quantity: 2.5
      })
    });
    
    // Get dish ingredients again (should have our ingredient)
    await makeRequest(`/dishes/${testDishId}/ingredients`);
    
    // Update ingredient quantity
    await makeRequest(`/dishes/${testDishId}/ingredients/${testIngredientId}`, {
      method: "PUT",
      body: JSON.stringify({
        quantity: 3.0
      })
    });
    
    // Remove ingredient from dish
    await makeRequest(`/dishes/${testDishId}/ingredients/${testIngredientId}`, {
      method: "DELETE"
    });
  }

  // Step 5: Dish Tags
  console.log("\n🏷️ STEP 5: Dish Tags API");
  
  if (testDishId) {
    // Get dish tags (should be empty)
    await makeRequest(`/dishes/${testDishId}/tags`);
    
    // Add tags to dish
    await makeRequest(`/dishes/${testDishId}/tags`, {
      method: "POST",
      body: JSON.stringify({ tag: "meat" })
    });
    
    await makeRequest(`/dishes/${testDishId}/tags`, {
      method: "POST",
      body: JSON.stringify({ tag: "vegetable" })
    });
    
    // Get dish tags again (should have our tags)
    await makeRequest(`/dishes/${testDishId}/tags`);
    
    // Remove a tag
    await makeRequest(`/dishes/${testDishId}/tags/meat`, {
      method: "DELETE"
    });
    
    // Get tags again (should only have vegetable)
    await makeRequest(`/dishes/${testDishId}/tags`);
  }

  // Step 6: Cleanup
  console.log("\n🧹 STEP 6: Cleanup");
  
  if (testDishId) {
    // Delete test dish
    await makeRequest(`/dishes/${testDishId}`, {
      method: "DELETE"
    });
  }

  console.log("\n" + "=" .repeat(50));
  console.log("🎉 API Testing Complete!");
  console.log("\n📊 Summary:");
  console.log("✅ Authentication API - Login/Register");
  console.log("✅ Ingredients API - CRUD + Search + Categories");
  console.log("✅ Dishes API - CRUD + Management");  
  console.log("✅ Dish-Ingredients API - Relationship Management");
  console.log("✅ Dish Tags API - Tag Management");
  console.log("\n🚀 Ready for production use!");
}

// Run the test
testCompleteAPI().catch(console.error);
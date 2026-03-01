const BASE_URL = "http://localhost:3001/notiservice/api/v1";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const logTest = (method, path, status, expected, result) => {
  const pass = status === expected;
  const icon = pass ? "✅" : "❌";
  console.log(`${icon} ${method} ${path} => ${status} (expected ${expected}) - ${result}`);
  return pass;
};

async function runSmoke() {
  console.log("\n========== NOTIFICATION SERVICE SMOKE TEST ==========\n");
  
  const results = [];
  let testCount = 0;
  let passCount = 0;

  try {
    // Test 1: Create notification with valid data
    testCount++;
    console.log("TEST 1: Create notification with valid data");
    const createRes = await fetch(`${BASE_URL}/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: "Test Notification",
        content: "This is a test notification email",
        recipientEmail: ["user@example.com"]
      })
    });
    const createData = await createRes.json();
    const test1Pass = logTest("POST", "/notifications", createRes.status, 201, createData.message);
    if (test1Pass) passCount++;
    results.push({ test: "Create notification", pass: test1Pass, status: createRes.status });
    const notificationId = createData.data?._id;

    // Test 2: Get notification by ID
    if (notificationId) {
      testCount++;
      console.log("\nTEST 2: Get notification by ID");
      const getRes = await fetch(`${BASE_URL}/notifications/${notificationId}`);
      const getData = await getRes.json();
      const test2Pass = logTest("GET", `/notifications/${notificationId}`, getRes.status, 200, getData.message);
      if (test2Pass) passCount++;
      results.push({ test: "Get notification by ID", pass: test2Pass, status: getRes.status });
    }

    // Test 3: Create notification with invalid email
    testCount++;
    console.log("\nTEST 3: Create notification with invalid email");
    const invalidRes = await fetch(`${BASE_URL}/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: "Test",
        content: "Test",
        recipientEmail: ["invalid-email"]
      })
    });
    const invalidData = await invalidRes.json();
    const test3Pass = logTest("POST", "/notifications", invalidRes.status, 400, "Invalid email validation");
    if (test3Pass) passCount++;
    results.push({ test: "Invalid email validation", pass: test3Pass, status: invalidRes.status });

    // Test 4: Create notification with missing subject
    testCount++;
    console.log("\nTEST 4: Create notification with missing subject");
    const missingRes = await fetch(`${BASE_URL}/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "Test",
        recipientEmail: ["user@example.com"]
      })
    });
    const missingData = await missingRes.json();
    const test4Pass = logTest("POST", "/notifications", missingRes.status, 400, "Required field validation");
    if (test4Pass) passCount++;
    results.push({ test: "Required field validation", pass: test4Pass, status: missingRes.status });

    // Test 5: Get pending notifications
    testCount++;
    console.log("\nTEST 5: Get pending notifications");
    const pendingRes = await fetch(`${BASE_URL}/notifications/status/pending`);
    const pendingData = await pendingRes.json();
    const test5Pass = logTest("GET", "/notifications/status/pending", pendingRes.status, 200, `Found ${pendingData.data?.length || 0} notifications`);
    if (test5Pass) passCount++;
    results.push({ test: "Get pending notifications", pass: test5Pass, status: pendingRes.status });

    // Test 6: Get non-existent notification
    testCount++;
    console.log("\nTEST 6: Get non-existent notification");
    const notFoundRes = await fetch(`${BASE_URL}/notifications/000000000000000000000000`);
    const test6Pass = logTest("GET", "/notifications/:id (not found)", notFoundRes.status, 404, "Notification not found");
    if (test6Pass) passCount++;
    results.push({ test: "Get non-existent notification", pass: test6Pass, status: notFoundRes.status });

    // Test 7: Create notification with multiple recipients
    testCount++;
    console.log("\nTEST 7: Create notification with multiple recipients");
    const multiRes = await fetch(`${BASE_URL}/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: "Multi-recipient Test",
        content: "Sending to multiple users",
        recipientEmail: ["user1@example.com", "user2@example.com", "user3@example.com"]
      })
    });
    const multiData = await multiRes.json();
    const test7Pass = logTest("POST", "/notifications (multiple)", multiRes.status, 201, "Multiple recipients created");
    if (test7Pass) passCount++;
    results.push({ test: "Create multi-recipient notification", pass: test7Pass, status: multiRes.status });

  } catch (error) {
    console.error("❌ Test error:", error.message);
  }

  // Summary
  console.log("\n========== TEST SUMMARY ==========");
  console.log(`Total Tests: ${testCount}`);
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${testCount - passCount}`);
  console.log(`Pass Rate: ${((passCount / testCount) * 100).toFixed(2)}%\n`);

  const overallStatus = passCount === testCount ? "✅ ALL TESTS PASSED" : `⚠️  ${testCount - passCount} TESTS FAILED`;
  console.log(overallStatus);
  
  return { overall: passCount === testCount ? "PASS" : "FAIL", details: results, passCount, testCount };
}

// Run tests
runSmoke().then(result => {
  process.exit(result.overall === "PASS" ? 0 : 1);
}).catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});

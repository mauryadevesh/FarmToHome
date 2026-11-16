const http = require('http');
const app = require('../api/index');

const PORT = 5892; // Isolated port for testing

async function runTests() {
  const server = app.listen(PORT, '127.0.0.1');

  function request(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: PORT,
          path,
          method,
          headers
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              resolve({ status: res.statusCode, data: parsed });
            } catch (e) {
              resolve({ status: res.statusCode, raw: data });
            }
          });
        }
      );

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  console.log('🧪 Starting API Verification Tests...');
  let failed = 0;

  try {
    // 1. Health Check
    const health = await request('GET', '/api/health');
    console.log(`[TEST 1] GET /api/health -> Status: ${health.status}, Engine: ${health.data?.databaseEngine}`);
    if (health.status !== 200 || health.data?.status !== 'online') failed++;

    // 2. Public Products
    const products = await request('GET', '/api/products');
    console.log(`[TEST 2] GET /api/products -> Status: ${products.status}, Count: ${products.data?.length}`);
    if (products.status !== 200 || !Array.isArray(products.data) || products.data.length === 0) failed++;

    // 3. Login Consumer
    const consumerLogin = await request('POST', '/api/auth/login', {
      email: 'consumer@farmtohome.com',
      password: 'password123'
    });
    console.log(`[TEST 3] POST /api/auth/login (consumer) -> Status: ${consumerLogin.status}, Token: ${Boolean(consumerLogin.data?.token)}`);
    if (consumerLogin.status !== 200 || !consumerLogin.data?.token) failed++;
    const consumerToken = consumerLogin.data?.token;

    // 4. Consumer Profile (/api/auth/me)
    const me = await request('GET', '/api/auth/me', null, consumerToken);
    console.log(`[TEST 4] GET /api/auth/me -> Status: ${me.status}, User: ${me.data?.name} (${me.data?.role})`);
    if (me.status !== 200 || me.data?.role !== 'consumer') failed++;

    // 5. Cart Operations
    const sampleProduct = products.data[0];
    const addToCart = await request('POST', '/api/cart', {
      productId: sampleProduct.id || sampleProduct._id,
      quantity: 2
    }, consumerToken);
    console.log(`[TEST 5] POST /api/cart -> Status: ${addToCart.status}, Cart Items: ${addToCart.data?.items?.length}`);
    if (addToCart.status !== 200) failed++;

    const getCart = await request('GET', '/api/cart', null, consumerToken);
    console.log(`[TEST 6] GET /api/cart -> Status: ${getCart.status}, Items: ${getCart.data?.items?.length}`);
    if (getCart.status !== 200 || getCart.data?.items?.length === 0) failed++;

    // 6. Orders
    const getOrders = await request('GET', '/api/orders', null, consumerToken);
    console.log(`[TEST 7] GET /api/orders -> Status: ${getOrders.status}, Count: ${getOrders.data?.length}`);
    if (getOrders.status !== 200) failed++;

    // 7. Login Admin
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@farmtohome.com',
      password: 'admin123'
    });
    console.log(`[TEST 8] POST /api/auth/login (admin) -> Status: ${adminLogin.status}`);
    if (adminLogin.status !== 200) failed++;
    const adminToken = adminLogin.data?.token;

    // 8. Admin Stats
    const adminStats = await request('GET', '/api/admin/stats', null, adminToken);
    console.log(`[TEST 9] GET /api/admin/stats -> Status: ${adminStats.status}, Users: ${adminStats.data?.totalUsers}, Products: ${adminStats.data?.totalProducts}`);
    if (adminStats.status !== 200) failed++;

    console.log('-------------------------------------------');
    if (failed === 0) {
      console.log('🎉 ALL API ENDPOINTS VERIFIED SUCCESSFULLY (PASS)');
    } else {
      console.error(`❌ ${failed} TESTS FAILED`);
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runTests();

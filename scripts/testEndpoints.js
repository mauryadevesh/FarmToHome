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

  console.log('🧪 Starting Farm2Home Comprehensive API Verification Tests...');
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

    // 3. Delivery Slots (Mira Bhayandar)
    const slots = await request('GET', '/api/delivery/slots');
    console.log(`[TEST 3] GET /api/delivery/slots -> Status: ${slots.status}, Slots Count: ${slots.data?.length}`);
    if (slots.status !== 200 || !Array.isArray(slots.data) || slots.data.length === 0) failed++;

    // 4. Public Farmers Directory
    const farmers = await request('GET', '/api/auth/farmers');
    console.log(`[TEST 4] GET /api/auth/farmers -> Status: ${farmers.status}, Farmers: ${farmers.data?.length}`);
    if (farmers.status !== 200 || !Array.isArray(farmers.data)) failed++;

    // 5. Login Consumer
    const consumerLogin = await request('POST', '/api/auth/login', {
      email: 'consumer@farmtohome.com',
      password: 'password123'
    });
    console.log(`[TEST 5] POST /api/auth/login (consumer) -> Status: ${consumerLogin.status}, Token: ${Boolean(consumerLogin.data?.token)}`);
    if (consumerLogin.status !== 200 || !consumerLogin.data?.token) failed++;
    const consumerToken = consumerLogin.data?.token;

    // 6. Consumer Profile (/api/auth/me)
    const me = await request('GET', '/api/auth/me', null, consumerToken);
    console.log(`[TEST 6] GET /api/auth/me -> Status: ${me.status}, User: ${me.data?.name} (${me.data?.role})`);
    if (me.status !== 200 || me.data?.role !== 'consumer') failed++;

    // 7. Cart Operations & Slot Reservation
    const sampleProduct = products.data[0];
    const addToCart = await request('POST', '/api/cart', {
      productId: sampleProduct.id || sampleProduct._id,
      quantity: 2
    }, consumerToken);
    console.log(`[TEST 7] POST /api/cart -> Status: ${addToCart.status}, Cart Items: ${addToCart.data?.items?.length}`);
    if (addToCart.status !== 200) failed++;

    // 8. Place Order with Delivery Slot in Mira Bhayandar
    const selectedSlot = slots.data[0];
    const placeOrder = await request('POST', '/api/orders', {
      items: [
        {
          productId: sampleProduct.id || sampleProduct._id,
          name: sampleProduct.name,
          price: sampleProduct.price,
          quantity: 2,
          unit: sampleProduct.unit
        }
      ],
      totalAmount: (sampleProduct.price || 40) * 2,
      shippingAddress: 'Flat 402, Shanti Park, Mira Road East, 401107',
      paymentMethod: 'cash_on_delivery',
      deliverySlotId: selectedSlot.id,
      deliveryDate: 'Tomorrow Morning',
      deliveryTimeSlot: selectedSlot.time_window || selectedSlot.timeWindow
    }, consumerToken);
    console.log(`[TEST 8] POST /api/orders (with slot) -> Status: ${placeOrder.status}, OrderId: ${placeOrder.data?._id || placeOrder.data?.id}`);
    if (placeOrder.status !== 201 && placeOrder.status !== 200) failed++;
    const createdOrderId = placeOrder.data?._id || placeOrder.data?.id;

    // 9. 6-Stage Delivery Tracking
    const tracking = await request('GET', `/api/delivery/track/${createdOrderId}`, null, consumerToken);
    console.log(`[TEST 9] GET /api/delivery/track/${createdOrderId} -> Status: ${tracking.status}, DeliveryStatus: ${tracking.data?.deliveryStatus || tracking.data?.status}`);
    if (tracking.status !== 200 || !tracking.data?.trackingStages) failed++;

    // 10. Reviews for Product
    const reviews = await request('GET', `/api/reviews/product/${sampleProduct.id || sampleProduct._id}`);
    console.log(`[TEST 10] GET /api/reviews/product/${sampleProduct.id || sampleProduct._id} -> Status: ${reviews.status}, Reviews Count: ${reviews.data?.length}`);
    if (reviews.status !== 200) failed++;

    // 11. Login Admin
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@farmtohome.com',
      password: 'admin123'
    });
    console.log(`[TEST 11] POST /api/auth/login (admin) -> Status: ${adminLogin.status}`);
    if (adminLogin.status !== 200) failed++;
    const adminToken = adminLogin.data?.token;

    // 12. Admin Stats
    const adminStats = await request('GET', '/api/admin/stats', null, adminToken);
    console.log(`[TEST 12] GET /api/admin/stats -> Status: ${adminStats.status}, Users: ${adminStats.data?.totalUsers}, Products: ${adminStats.data?.totalProducts}`);
    if (adminStats.status !== 200) failed++;

    // 13. Admin Advance Delivery Status to "out_for_delivery"
    const updateDelivery = await request('PUT', `/api/delivery/status/${createdOrderId}`, {
      status: 'out_for_delivery',
      notes: 'Driver Deepak Verma departed Uttan transit hub on route to Shanti Park'
    }, adminToken);
    console.log(`[TEST 13] PUT /api/delivery/status/${createdOrderId} -> Status: ${updateDelivery.status}, New Status: ${updateDelivery.data?.status || updateDelivery.data?.order?.status}`);
    if (updateDelivery.status !== 200) failed++;

    console.log('----------------------------------------------------');
    if (failed === 0) {
      console.log('🎉 ALL 13 FARM2HOME API ENDPOINTS VERIFIED AND PASSING!');
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

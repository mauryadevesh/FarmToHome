const http = require('http');
const app = require('../api/index');

const PORT = 5894; // Isolated test port

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

  console.log('🧪 Starting Farm2Home Comprehensive Role, Security & Permission Verification...');
  let failed = 0;

  try {
    // 1. Health Check
    const health = await request('GET', '/api/health');
    console.log(`[TEST 1] GET /api/health -> Status: ${health.status}, AppName: ${health.data?.appName}`);
    if (health.status !== 200 || health.data?.status !== 'online') failed++;

    // 2. Public Catalog & Delivery Slots
    const products = await request('GET', '/api/products');
    const slots = await request('GET', '/api/delivery/slots');
    console.log(`[TEST 2] Public Catalog -> Products: ${products.data?.length}, Slots: ${slots.data?.length}`);
    if (products.status !== 200 || slots.status !== 200 || products.data.length === 0) failed++;

    // 3. Authenticate All 3 Roles
    const consumerLogin = await request('POST', '/api/auth/login', {
      email: 'consumer@farmtohome.com',
      password: 'password123'
    });
    const farmerLogin = await request('POST', '/api/auth/login', {
      email: 'farmer@farmtohome.com',
      password: 'password123'
    });
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@farmtohome.com',
      password: 'admin123'
    });

    const consumerToken = consumerLogin.data?.token;
    const farmerToken = farmerLogin.data?.token;
    const adminToken = adminLogin.data?.token;

    console.log(`[TEST 3] Role Tokens Acquired -> Consumer: ${Boolean(consumerToken)}, Farmer: ${Boolean(farmerToken)}, Admin: ${Boolean(adminToken)}`);
    if (!consumerToken || !farmerToken || !adminToken) failed++;

    // 4. SECURITY CHECK: Customer MUST NOT access admin endpoints
    const customerAdminAccess = await request('GET', '/api/admin/stats', null, consumerToken);
    console.log(`[TEST 4] Guard Admin Stats against Consumer -> Status: ${customerAdminAccess.status} (Expected 403)`);
    if (customerAdminAccess.status !== 403) failed++;

    // 5. SECURITY CHECK: Farmer MUST NOT access admin endpoints
    const farmerAdminAccess = await request('GET', '/api/admin/stats', null, farmerToken);
    console.log(`[TEST 5] Guard Admin Stats against Farmer -> Status: ${farmerAdminAccess.status} (Expected 403)`);
    if (farmerAdminAccess.status !== 403) failed++;

    // 6. ROLE CHECK: Consumer adds item to cart & places order with delivery slot
    const sampleProduct = products.data[0];
    const addToCart = await request('POST', '/api/cart', {
      productId: sampleProduct.id || sampleProduct._id,
      quantity: 2
    }, consumerToken);
    console.log(`[TEST 6] Consumer Add to Cart -> Status: ${addToCart.status}, Items: ${addToCart.data?.items?.length}`);
    if (addToCart.status !== 200) failed++;

    // 7. SECURITY CHECK: Admin MUST NOT maintain shopping cart
    const adminAddToCart = await request('POST', '/api/cart', {
      productId: sampleProduct.id || sampleProduct._id,
      quantity: 1
    }, adminToken);
    console.log(`[TEST 7] Guard Cart from Admin -> Status: ${adminAddToCart.status} (Expected 403)`);
    if (adminAddToCart.status !== 403) failed++;

    // 8. Consumer places valid order in Mira Bhayandar
    const selectedSlot = slots.data[0];
    const placeOrder = await request('POST', '/api/orders', {
      shippingAddress: 'Flat 302, Beverly Park, Mira Road East, 401107',
      deliverySlotId: selectedSlot.id || selectedSlot._id,
      deliveryDate: 'Tomorrow Morning',
      deliveryTimeSlot: selectedSlot.time_window || selectedSlot.timeWindow,
      paymentMethod: 'cod'
    }, consumerToken);
    const orderId = placeOrder.data?.id || placeOrder.data?._id;
    console.log(`[TEST 8] Consumer Place Order -> Status: ${placeOrder.status}, OrderId: ${orderId}`);
    if (placeOrder.status !== 201 || !orderId) failed++;

    // 9. SECURITY CHECK: Customer MUST NOT manually advance delivery stages
    const customerAdvanceDelivery = await request('PUT', `/api/delivery/status/${orderId}`, {
      status: 'Out for Delivery'
    }, consumerToken);
    console.log(`[TEST 9] Guard Delivery Stage from Customer -> Status: ${customerAdvanceDelivery.status} (Expected 403)`);
    if (customerAdvanceDelivery.status !== 403) failed++;

    // 10. WORKFLOW CHECK: Farmer advances harvest availability to "Accepted"
    const farmerAccept = await request('PUT', `/api/delivery/status/${orderId}`, {
      status: 'Accepted'
    }, farmerToken);
    console.log(`[TEST 10] Farmer Accept Harvest Availability -> Status: ${farmerAccept.status}, Stage: ${farmerAccept.data?.deliveryStatus || farmerAccept.data?.status}`);
    if (farmerAccept.status !== 200) failed++;

    // 11. SECURITY CHECK: Farmer MUST NOT mark an order as "Out for Delivery" (Delivery/Admin only)
    const farmerOutForDelivery = await request('PUT', `/api/delivery/status/${orderId}`, {
      status: 'Out for Delivery'
    }, farmerToken);
    console.log(`[TEST 11] Guard "Out for Delivery" from Farmer -> Status: ${farmerOutForDelivery.status} (Expected 403)`);
    if (farmerOutForDelivery.status !== 403) failed++;

    // 12. Admin/Delivery Logistics advances order to "Out for Delivery"
    const adminDispatch = await request('PUT', `/api/delivery/status/${orderId}`, {
      status: 'Out for Delivery',
      driverName: 'Sanjay Raut',
      driverPhone: '+91 98205 99887'
    }, adminToken);
    console.log(`[TEST 12] Admin Dispatch Order -> Status: ${adminDispatch.status}`);
    if (adminDispatch.status !== 200) failed++;

    // 13. SECURITY CHECK: Consumer CANNOT cancel an order once Out for Delivery
    const customerCancelDispatched = await request('DELETE', `/api/orders/${orderId}`, null, consumerToken);
    console.log(`[TEST 13] Guard Cancellation of Dispatched Order -> Status: ${customerCancelDispatched.status} (Expected 400)`);
    if (customerCancelDispatched.status !== 400) failed++;

    // 14. Admin marks order as "Delivered"
    const adminDelivered = await request('PUT', `/api/delivery/status/${orderId}`, {
      status: 'Delivered'
    }, adminToken);
    console.log(`[TEST 14] Admin Mark Delivered -> Status: ${adminDelivered.status}`);
    if (adminDelivered.status !== 200) failed++;

    // 15. Reviews: Consumer submits verified review
    const submitReview = await request('POST', '/api/reviews', {
      productId: sampleProduct.id || sampleProduct._id,
      rating: 5,
      comment: 'Super fresh vine tomatoes delivered straight from Uttan farm within 4 hours!'
    }, consumerToken);
    console.log(`[TEST 15] Consumer Verified Review -> Status: ${submitReview.status}`);
    if (submitReview.status !== 201) failed++;

    // 16. SECURITY CHECK: Farmer CANNOT submit customer reviews
    const farmerReview = await request('POST', '/api/reviews', {
      productId: sampleProduct.id || sampleProduct._id,
      rating: 5,
      comment: 'My own crop is great'
    }, farmerToken);
    console.log(`[TEST 16] Guard Review from Farmer -> Status: ${farmerReview.status} (Expected 403)`);
    if (farmerReview.status !== 403) failed++;

    // 17. Support Ticket Resolution: Consumer creates, Admin resolves
    const newTicket = await request('POST', '/api/support', {
      subject: 'Inquiry regarding morning harvest delivery window',
      message: 'Can I request delivery by 7:30 AM before leaving for office?',
      category: 'delivery'
    }, consumerToken);
    const ticketId = newTicket.data?.id || newTicket.data?._id;
    console.log(`[TEST 17] Consumer Create Support Ticket -> Status: ${newTicket.status}, TicketId: ${ticketId}`);
    if (newTicket.status !== 201) failed++;

    // 18. SECURITY CHECK: Consumer CANNOT respond to/resolve support tickets
    const consumerResolve = await request('PUT', `/api/support/${ticketId}/respond`, {
      response: 'I will resolve it myself'
    }, consumerToken);
    console.log(`[TEST 18] Guard Ticket Resolution from Consumer -> Status: ${consumerResolve.status} (Expected 403)`);
    if (consumerResolve.status !== 403) failed++;

    // 19. Admin resolves support ticket
    const adminResolve = await request('PUT', `/api/support/${ticketId}/respond`, {
      response: 'Yes, our electric van #03 reaches Beverly Park at 7:15 AM daily.'
    }, adminToken);
    console.log(`[TEST 19] Admin Resolve Support Ticket -> Status: ${adminResolve.status}`);
    if (adminResolve.status !== 200) failed++;

    // 20. Admin Delivery Slot Management
    const adminSlots = await request('GET', '/api/delivery/slots', null, adminToken);
    const firstSlot = adminSlots.data[0];
    const updateSlot = await request('PUT', `/api/delivery/slots/${firstSlot.id || firstSlot._id}`, {
      maxCapacity: 30
    }, adminToken);
    console.log(`[TEST 20] Admin Update Delivery Slot Capacity -> Status: ${updateSlot.status}, New Capacity: ${updateSlot.data?.max_capacity || updateSlot.data?.maxCapacity}`);
    if (updateSlot.status !== 200) failed++;

    console.log('----------------------------------------------------------------------');
    if (failed === 0) {
      console.log('🎉 ALL 20 ROLE, SECURITY & WORKFLOW VERIFICATION TESTS PASSED (100%)!');
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

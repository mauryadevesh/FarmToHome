import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaLeaf, FaTruck, FaRupeeSign, FaUsers, FaArrowRight, FaPhoneAlt, FaWhatsapp, FaSeedling, FaShieldAlt } from 'react-icons/fa';

const categories = [
  { name: 'Fresh Vegetables', icon: '🥕', category: 'vegetables', count: '9 items' },
  { name: 'Farm Fruits', icon: '🍎', category: 'fruits', count: '6 items' },
  { name: 'Whole Grains', icon: '🌾', category: 'grains', count: '4 items' },
  { name: 'Pulses & Dals', icon: '🥣', category: 'pulses', count: '4 items' },
  { name: 'Dairy & Poultry', icon: '🥛', category: 'dairy', count: '3 items' },
];

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">
            <FaSeedling style={{ marginRight: '6px', color: '#2e7d32' }} />
            100% Direct Harvest • No Middlemen
          </span>
          <h1>Fresh Produce From Village Farms Directly To Your Table</h1>
          <p className="hero-caption">Honest food grown with love and care by local farmers.</p>
          <p className="hero-description">
            Skip cold storage and long distributor chains. Connect directly with real family farms
            and get vegetables, fruits, grains, and dairy harvested within hours and delivered to your doorstep.
          </p>
          <div className="hero-buttons">
            <Link to="/products" className="btn btn-primary btn-large">
              <span>Browse Fresh Produce</span>
              <FaArrowRight style={{ marginLeft: '8px' }} />
            </Link>
            {!isAuthenticated && (
              <Link to="/register" state={{ role: 'consumer' }} className="btn btn-outline btn-large">
                Join FarmToHome
              </Link>
            )}
            {isAuthenticated && user?.role === 'farmer' && (
              <Link to="/farmer-dashboard" className="btn btn-secondary btn-large">
                Go to Farm Dashboard
              </Link>
            )}
          </div>

          <div className="hero-trust-bar">
            <div className="trust-item">
              <strong>100%</strong>
              <span>Pesticide-Tested</span>
            </div>
            <div className="trust-divider">•</div>
            <div className="trust-item">
              <strong>Fair Prices</strong>
              <span>Direct to Farmer</span>
            </div>
            <div className="trust-divider">•</div>
            <div className="trust-item">
              <strong>Next Day</strong>
              <span>Morning Delivery</span>
            </div>
          </div>
        </div>

        <div className="hero-image">
          <div className="hero-card-display">
            <div className="hero-badge-floating">
              <span className="floating-icon">🌱</span>
              <div>
                <strong>Harvested Today</strong>
                <span>Morning 6:00 AM</span>
              </div>
            </div>
            <div className="hero-card-banner">
              <div className="hero-veg-icons">
                <span className="big-emoji" title="Tomato">🍅</span>
                <span className="big-emoji" title="Carrot">🥕</span>
                <span className="big-emoji" title="Wheat">🌾</span>
                <span className="big-emoji" title="Apple">🍎</span>
                <span className="big-emoji" title="Milk">🥛</span>
              </div>
              <div className="hero-banner-text">
                <h3>Fresh, Seasonal & Local</h3>
                <p>Support your region's hardworking cultivators directly.</p>
              </div>
            </div>
            <div className="hero-badge-floating bottom">
              <span className="floating-icon">🚜</span>
              <div>
                <strong>50+ Verified Farmers</strong>
                <span>Karnataka, MH & AP</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Category Browse */}
      <section className="categories-section">
        <div className="section-header">
          <h2>Shop by Farm Category</h2>
          <p>Hand-picked, clean, and weighed accurately with standard packaging.</p>
        </div>
        <div className="category-grid">
          {categories.map((cat) => (
            <Link
              key={cat.category}
              to={`/products?category=${cat.category}`}
              className="category-card"
            >
              <span className="category-icon">{cat.icon}</span>
              <h3>{cat.name}</h3>
              <span className="category-count">{cat.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="section-header">
          <h2>Why People Choose FarmToHome</h2>
          <p>A simple, human bridge between rural agricultural growers and urban households.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><FaTruck /></div>
            <h3>Direct Harvest Delivery</h3>
            <p>Produce doesn't sit for weeks in distributor warehouses. It comes straight from fields to your home.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FaLeaf /></div>
            <h3>Fresh & Naturally Grown</h3>
            <p>We work with farmers using sustainable practices, organic compost, and minimal synthetic chemicals.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FaRupeeSign /></div>
            <h3>Fair Prices for Everyone</h3>
            <p>Eliminating middlemen means farmers earn 25-40% more while consumers pay honest market rates.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><FaUsers /></div>
            <h3>Empowering Rural Communities</h3>
            <p>Every rupee spent directly enriches a farming family, building a resilient local food ecosystem.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Four easy steps from field to your kitchen.</p>
        </div>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Browse Fresh Produce</h3>
            <p>Explore today's available stock from nearby farms at transparent per-kg prices.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Add to Your Basket</h3>
            <p>Pick the quantity you need, review your fresh cart, and choose delivery address.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Farmer Prepares Your Order</h3>
            <p>Your order is sent directly to the local farmer, who harvests and packs it fresh.</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Next-Morning Delivery</h3>
            <p>Enjoy crisp greens, sweet fruit, and pure dairy on your breakfast table.</p>
          </div>
        </div>
      </section>

      {/* Human Support Section */}
      <section className="support">
        <div className="support-wrapper">
          <div className="support-intro">
            <h2>Need Any Help? Talk to Real People</h2>
            <p>
              We believe in warm, personal customer service. If you have questions about produce quality,
              an active order, or want to onboard your farm, reach out directly:
            </p>
          </div>
          <div className="support-info">
            <div className="support-item">
              <div className="support-icon"><FaPhoneAlt /></div>
              <div className="support-details">
                <h3>Customer Helpline</h3>
                <p>Mon - Sat, 8:00 AM - 8:00 PM</p>
                <a href="tel:7671014068" className="contact-number">
                  📞 +91 76710 14068
                </a>
              </div>
            </div>
            <div className="support-item">
              <div className="support-icon"><FaWhatsapp /></div>
              <div className="support-details">
                <h3>WhatsApp Direct Help</h3>
                <p>Quick chat for order updates & queries</p>
                <a
                  href="https://wa.me/917671014068?text=Hello%20FarmToHome,%20I%20have%20a%20query"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-number whatsapp-link"
                >
                  💬 Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta">
        <div className="cta-content">
          {isAuthenticated ? (
            <>
              <h2>Welcome back, {user?.name}!</h2>
              <p>Fresh batches were added today from farms around you.</p>
              <div className="cta-buttons">
                <Link to="/products" className="btn btn-primary btn-large">
                  Explore Fresh Produce
                </Link>
                {user?.role === 'consumer' && (
                  <Link to="/orders" className="btn btn-outline btn-large">
                    View My Orders
                  </Link>
                )}
                {user?.role === 'farmer' && (
                  <Link to="/farmer-dashboard" className="btn btn-outline btn-large">
                    Add New Harvest
                  </Link>
                )}
              </div>
            </>
          ) : (
            <>
              <h2>Ready to Taste Real Farm Freshness?</h2>
              <p>Join thousands of families eating healthier and supporting local rural farmers.</p>
              <div className="cta-buttons">
                <Link to="/register" state={{ role: 'consumer' }} className="btn btn-primary btn-large">
                  Sign Up as Consumer
                </Link>
                <Link to="/register" state={{ role: 'farmer' }} className="btn btn-outline btn-large">
                  Register as Farmer
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;

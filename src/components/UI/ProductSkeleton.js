import React from 'react';

export const ProductSkeletonCard = () => {
  return (
    <div className="product-card skeleton-card" aria-hidden="true">
      <div className="product-image skeleton-image skeleton-shimmer" />
      <div className="product-info">
        <div className="product-top-meta">
          <div className="skeleton-pill skeleton-shimmer" style={{ width: '80px', height: '22px' }} />
          <div className="skeleton-pill skeleton-shimmer" style={{ width: '70px', height: '22px' }} />
        </div>

        <div className="skeleton-line skeleton-shimmer" style={{ width: '60%', height: '20px', margin: '8px 0 6px 0' }} />
        <div className="skeleton-line skeleton-shimmer" style={{ width: '92%', height: '14px', marginBottom: '6px' }} />
        <div className="skeleton-line skeleton-shimmer" style={{ width: '75%', height: '14px', marginBottom: '14px' }} />

        <div className="product-farmer" style={{ gap: '8px' }}>
          <div className="skeleton-pill skeleton-shimmer" style={{ width: '16px', height: '16px', borderRadius: '50%' }} />
          <div className="skeleton-line skeleton-shimmer" style={{ width: '130px', height: '14px' }} />
        </div>

        <div className="product-pricing-bar" style={{ marginTop: 'auto', paddingTop: '14px' }}>
          <div className="skeleton-line skeleton-shimmer" style={{ width: '68px', height: '26px' }} />
          <div className="skeleton-pill skeleton-shimmer" style={{ width: '110px', height: '36px', borderRadius: 'var(--radius-sm)' }} />
        </div>
      </div>
    </div>
  );
};

export const ProductSkeletonGrid = ({ count = 8 }) => {
  return (
    <div className="products-grid skeleton-grid" role="status" aria-label="Loading produce items...">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductSkeletonCard key={`skeleton-card-${idx}`} />
      ))}
    </div>
  );
};

export default ProductSkeletonGrid;

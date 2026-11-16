const express = require('express');
const router = express.Router();
const dbAdapter = require('../services/dbAdapter');
const { auth } = require('../middleware/auth');

// @route   GET /api/reviews/product/:productId
// @desc    Get customer reviews for a produce item
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await dbAdapter.getReviews(req.params.productId);
    return res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ message: 'Error retrieving reviews' });
  }
});

// @route   POST /api/reviews
// @desc    Authenticated customer add verified review
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'consumer') {
      return res.status(403).json({ message: 'Only consumers can submit produce reviews.' });
    }

    const { productId, farmerId, rating, comment } = req.body;
    if (!productId || !comment || !comment.trim()) {
      return res.status(400).json({ message: 'Product ID and comment are required' });
    }

    const numericRating = parseInt(rating, 10);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }

    const userId = req.user.id || req.user._id;
    const review = await dbAdapter.addReview({
      productId,
      farmerId,
      userId,
      userName: req.user.name,
      rating: numericRating,
      comment: comment.trim()
    });

    return res.status(201).json(review);
  } catch (error) {
    console.error('Error submitting review:', error);
    return res.status(400).json({ message: error.message || 'Error submitting review' });
  }
});

module.exports = router;

const express = require('express');
const {
  getAllAnimals,
  getRandomFact,
  getAnimalById,
  createAnimal,
  updateAnimal,
  deleteAnimal,
} = require('../controllers/animals.controller');

const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

router.route('/').get(getAllAnimals).post(protect, restrictTo('admin'), createAnimal);
router.route('/random-fact').get(getRandomFact);

router.route('/:id').get(getAnimalById).put(protect, restrictTo('admin'), updateAnimal).delete(protect, restrictTo('admin'), deleteAnimal);

module.exports = router;

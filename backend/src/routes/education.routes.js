const express = require('express');
const router = express.Router();
const {
  createEducation,
  getAllEducation,
  getEducationByAnimal,
  updateEducation,
  deleteEducation,
} = require('../controllers/education.controller');

const { protect, restrictTo } = require('../middleware/auth.middleware');

router.route('/').get(getAllEducation).post(protect, restrictTo('admin'), createEducation);

router.route('/:id').put(protect, restrictTo('admin'), updateEducation).delete(protect, restrictTo('admin'), deleteEducation);

router.get('/animal/:animalId', getEducationByAnimal);

module.exports = router;

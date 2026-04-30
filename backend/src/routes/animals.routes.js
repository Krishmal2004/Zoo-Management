const express = require('express');
const animalsController = require('../controllers/animals.controller');

const router = express.Router();

router
  .route('/')
  .post(animalsController.addAnimal)
  .get(animalsController.getAllAnimals);

router.patch('/:id/unavailable', animalsController.markAnimalUnavailable);

router
  .route('/:id')
  .get(animalsController.getAnimalById)
  .patch(animalsController.updateAnimal)
  .delete(animalsController.deleteAnimal);

module.exports = router;

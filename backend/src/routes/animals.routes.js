const express = require('express');
const animalsController = require('../controllers/animals.controller');
const { createUpload } = require('../middleware/upload.middleware');

const router = express.Router();
const upload = createUpload('animals');

router.get('/random-fact', animalsController.getRandomFact);

router.route('/').post(upload.any(), animalsController.addAnimal).get(animalsController.getAllAnimals);

router.patch('/:id/unavailable', animalsController.markAnimalUnavailable);

router
  .route('/:id')
  .get(animalsController.getAnimalById)
  .patch(upload.any(), animalsController.updateAnimal)
  .delete(animalsController.deleteAnimal);

module.exports = router;

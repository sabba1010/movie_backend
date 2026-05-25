const express = require('express');
const { getAllFilms, getFilmById, createFilm, updateFilm, deleteFilm } = require('../controllers/film.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', getAllFilms);
router.get('/:id', getFilmById);

// Protected and admin only routes
router.post('/', protect, authorize('admin'), createFilm);
router.put('/:id', protect, authorize('admin'), updateFilm);
router.delete('/:id', protect, authorize('admin'), deleteFilm);

module.exports = router;

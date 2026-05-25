const Film = require('../models/Film');

exports.getAllFilms = async (req, res) => {
    try {
        const films = await Film.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: films.length, data: films });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getFilmById = async (req, res) => {
    try {
        const film = await Film.findById(req.params.id);
        if (!film) {
            return res.status(404).json({ success: false, message: 'Film not found' });
        }
        res.status(200).json({ success: true, data: film });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createFilm = async (req, res) => {
    try {
        const film = await Film.create(req.body);
        res.status(201).json({ success: true, data: film });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateFilm = async (req, res) => {
    try {
        const film = await Film.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!film) {
            return res.status(404).json({ success: false, message: 'Film not found' });
        }
        res.status(200).json({ success: true, data: film });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteFilm = async (req, res) => {
    try {
        const film = await Film.findByIdAndDelete(req.params.id);
        if (!film) {
            return res.status(404).json({ success: false, message: 'Film not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

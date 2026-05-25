exports.getAllFilms = async (req, res) => {
    res.status(200).json({ success: true, message: 'Get all films' });
};

exports.getFilmById = async (req, res) => {
    res.status(200).json({ success: true, message: `Get film ${req.params.id}` });
};

exports.createFilm = async (req, res) => {
    res.status(201).json({ success: true, message: 'Create a new film' });
};

exports.updateFilm = async (req, res) => {
    res.status(200).json({ success: true, message: `Update film ${req.params.id}` });
};

exports.deleteFilm = async (req, res) => {
    res.status(200).json({ success: true, message: `Delete film ${req.params.id}` });
};

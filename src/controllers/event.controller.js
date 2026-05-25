exports.getAllEvents = async (req, res) => {
    res.status(200).json({ success: true, message: 'Get all events' });
};

exports.getEventById = async (req, res) => {
    res.status(200).json({ success: true, message: `Get event ${req.params.id}` });
};

exports.createEvent = async (req, res) => {
    res.status(201).json({ success: true, message: 'Create a new event' });
};

exports.updateEvent = async (req, res) => {
    res.status(200).json({ success: true, message: `Update event ${req.params.id}` });
};

exports.deleteEvent = async (req, res) => {
    res.status(200).json({ success: true, message: `Delete event ${req.params.id}` });
};

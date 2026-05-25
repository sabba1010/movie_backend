exports.getAllUsers = async (req, res) => {
    res.status(200).json({ success: true, message: 'Get all users route' });
};

exports.getUserById = async (req, res) => {
    res.status(200).json({ success: true, message: `Get user ${req.params.id}` });
};

exports.updateUser = async (req, res) => {
    res.status(200).json({ success: true, message: `Update user ${req.params.id}` });
};

exports.deleteUser = async (req, res) => {
    res.status(200).json({ success: true, message: `Delete user ${req.params.id}` });
};

const Ticket = require('../models/Ticket');
const Event = require('../models/Event');

exports.createTicket = async (req, res) => {
    try {
        const { eventId, city, showtimeId, price } = req.body;
        
        // Find the event
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Generate a unique ticket ID
        const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;

        // Create the ticket
        const ticket = await Ticket.create({
            user: req.user.id,
            event: eventId,
            city,
            showtimeId,
            ticketId,
            pricePaid: price || event.price,
            status: 'Paid'
        });

        // Increment tickets sold on the event
        event.ticketsSold += 1;
        await event.save();

        res.status(201).json({ success: true, data: ticket });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ user: req.user.id }).populate('event', 'name date image location');
        res.status(200).json({ success: true, count: tickets.length, data: tickets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find().populate('user', 'name email').populate('event', 'name');
        res.status(200).json({ success: true, count: tickets.length, data: tickets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.checkInTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }
        
        ticket.checkedIn = true;
        await ticket.save();
        
        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

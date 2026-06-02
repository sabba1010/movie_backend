const Ticket = require('../models/Ticket');
const Event = require('../models/Event');

exports.createTicket = async (req, res) => {
    try {
        const { eventId, city, showtimeId, price, categoryName, quantity } = req.body;
        
        // Find the event
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        let ticketPrice = price || event.price;
        let selectedCategory = null;
        let numTickets = quantity ? parseInt(quantity) : 1;

        if (categoryName && event.categories && event.categories.length > 0) {
            selectedCategory = event.categories.find(c => c.name === categoryName);
            if (!selectedCategory) {
                return res.status(400).json({ success: false, message: 'Invalid category selected' });
            }
            if (selectedCategory.available < numTickets) {
                return res.status(400).json({ success: false, message: 'Not enough tickets available in this category' });
            }
            ticketPrice = selectedCategory.price;
        } else if (event.capacity && (event.capacity - event.ticketsSold) < numTickets) {
            return res.status(400).json({ success: false, message: 'Not enough tickets available' });
        }

        const ticketsToCreate = [];

        for (let i = 0; i < numTickets; i++) {
            // Generate a unique ticket ID
            const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}-${i}`;
            ticketsToCreate.push({
                user: req.user.id,
                event: eventId,
                city,
                showtimeId,
                ticketId,
                pricePaid: ticketPrice.toString(),
                status: 'Paid',
                category: categoryName || 'General'
            });
        }

        // Create the tickets
        const createdTickets = await Ticket.insertMany(ticketsToCreate);

        // Increment tickets sold on the event and update category available
        event.ticketsSold += numTickets;
        if (selectedCategory) {
            selectedCategory.available -= numTickets;
        }
        await event.save();

        res.status(201).json({ success: true, data: createdTickets[0] });
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

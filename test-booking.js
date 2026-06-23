require('dotenv').config();
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

async function testBooking() {
    try {
        const token = jwt.sign({ id: '6a13c8a7f0f65fa3ee43a8d3' }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // 2. Get Events
        const eventsRes = await fetch('https://movie-backend-drab.vercel.app/api/events');
        const eventsData = await eventsRes.json();
        console.log('Events:', eventsData.data.length);
        if (eventsData.data.length === 0) return;

        // 3. Book Ticket
        const eventId = eventsData.data[0]._id;
        const bookRes = await fetch('https://movie-backend-drab.vercel.app/api/tickets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                eventId: eventId,
                city: 'Global',
                showtimeId: 'General'
            })
        });
        const bookData = await bookRes.json();
        console.log('Booking Result:', bookData);
    } catch (e) {
        console.error('Error:', e);
    }
}
testBooking();

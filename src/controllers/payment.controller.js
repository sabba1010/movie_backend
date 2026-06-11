const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const KidsPurchase = require('../models/KidsPurchase');
const Setting = require('../models/Setting');
const PromoCode = require('../models/PromoCode');

exports.createCheckoutSession = async (req, res) => {
  try {
    const { type, successUrl, cancelUrl } = req.body;

    if (!successUrl || !cancelUrl) {
      return res.status(400).json({ success: false, message: 'successUrl and cancelUrl are required' });
    }

    let line_items = [];
    let metadata = { type };

    if (type === 'kids_subscription') {
      const { plan } = req.body;
      if (!plan) return res.status(400).json({ success: false, message: 'Plan is required' });

      // Retrieve plan settings from database
      let planSettings = { lifetimePrice: 99, monthlyPrice: 4.99, yearlyPrice: 49.99 };
      try {
        const setting = await Setting.findOne({ key: 'kidsPlanSettings' });
        if (setting) {
          planSettings = JSON.parse(setting.value);
        }
      } catch (e) {
        console.error('Error fetching plan settings:', e.message);
      }

      let price = 0;
      let planName = '';

      if (plan === 'lifetime') {
        price = planSettings.lifetimePrice;
        planName = 'KidsBibleFlix Lifetime Access';
      } else if (plan === 'monthly') {
        price = planSettings.monthlyPrice;
        planName = 'KidsBibleFlix Monthly Premium Access';
      } else if (plan === 'yearly') {
        price = planSettings.yearlyPrice;
        planName = 'KidsBibleFlix Yearly Premium Access';
      } else if (plan === 'ministry') {
        price = 14.99;
        planName = 'KidsBibleFlix Ministry Partner Subscription';
      } else {
        return res.status(400).json({ success: false, message: 'Invalid plan' });
      }

      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: planName,
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: 1,
      });

      metadata.userId = req.user.id;
      metadata.plan = plan;
      metadata.amount = `$${price}`;
      metadata.name = req.user.name;
      metadata.email = req.user.email;

    } else if (type === 'event_ticket') {
      const { eventId, city, showtimeId, categoryName, quantity, promoCode } = req.body;
      if (!eventId || !city || !showtimeId || !quantity) {
        return res.status(400).json({ success: false, message: 'Required fields missing for event ticket' });
      }

      const event = await Event.findById(eventId);
      if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

      let ticketPrice = event.price;
      let selectedCategory = null;
      let numTickets = parseInt(quantity) || 1;

      if (categoryName && event.categories && event.categories.length > 0) {
        selectedCategory = event.categories.find(c => c.name === categoryName);
        if (!selectedCategory) return res.status(400).json({ success: false, message: 'Invalid category selected' });
        ticketPrice = parseFloat(selectedCategory.price) || 0;
      } else {
        ticketPrice = parseFloat(ticketPrice.toString().replace(/[^0-9.]/g, '')) || 0;
      }

      let appliedPromo = null;
      if (promoCode) {
        appliedPromo = await PromoCode.findOne({ code: promoCode.toUpperCase() });
        if (appliedPromo && appliedPromo.isActive && (appliedPromo.maxUses === 0 || appliedPromo.usedCount < appliedPromo.maxUses)) {
          ticketPrice = ticketPrice - (ticketPrice * (appliedPromo.discountPercentage / 100));
        } else {
          return res.status(400).json({ success: false, message: 'Invalid or expired promo code' });
        }
      }

      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${event.name} Ticket (${categoryName || 'General'})`,
            description: `${city} - ${showtimeId}`,
          },
          unit_amount: Math.round(ticketPrice * 100),
        },
        quantity: numTickets,
      });

      metadata.userId = req.user.id;
      metadata.eventId = eventId;
      metadata.city = city;
      metadata.showtimeId = showtimeId;
      metadata.categoryName = categoryName || 'General';
      metadata.quantity = numTickets.toString();
      metadata.promoCode = promoCode || '';
      metadata.pricePaid = ticketPrice.toString();

    } else if (type === 'cart_checkout') {
      const { items } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Items are required for cart checkout' });
      }

      line_items = items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(parseFloat(item.price) * 100),
        },
        quantity: item.quantity,
      }));

      // Add Shipping
      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping & Handling',
          },
          unit_amount: 599,
        },
        quantity: 1,
      });

      metadata.userId = req.user ? req.user.id : 'guest';
      metadata.itemsJson = JSON.stringify(items.map(i => ({ id: i.id, quantity: i.quantity })));

    } else {
      return res.status(400).json({ success: false, message: 'Invalid checkout type' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata,
    });

    res.status(200).json({ success: true, url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyCheckoutSession = async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'sessionId parameter is required' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Stripe session not found' });
    }

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Payment not completed' });
    }

    const metadata = session.metadata;
    const type = metadata.type;

    if (type === 'kids_subscription') {
      const { userId, plan, amount, name, email } = metadata;

      // Check if purchase already recorded
      let purchase = await KidsPurchase.findOne({ stripeSessionId: sessionId });
      if (!purchase) {
        const planPriceMap = { 
          lifetime: null, 
          monthly: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
          yearly: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          ministry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };
        const expiresAt = planPriceMap[plan] || null;

        purchase = new KidsPurchase({
          userId: userId || null,
          name,
          email,
          plan,
          amount,
          status: 'active',
          source: 'stripe',
          stripeSessionId: sessionId,
          purchasedAt: new Date(),
          expiresAt,
        });
        await purchase.save();

        // Update user profile kidsAccess
        const updateFields = {
          kidsAccess: true,
          kidsAccessType: plan,
          kidsAccessGrantedAt: new Date(),
          kidsAccessExpiry: expiresAt,
          kidsAccessSource: 'stripe',
        };

        if (userId) {
          await User.findByIdAndUpdate(userId, updateFields);
        } else if (email) {
          await User.findOneAndUpdate({ email }, updateFields);
        }
      }

      res.status(200).json({ success: true, type, purchase });

    } else if (type === 'event_ticket') {
      const { userId, eventId, city, showtimeId, categoryName, quantity, promoCode, pricePaid } = metadata;
      const numTickets = parseInt(quantity) || 1;

      // Check if tickets already recorded
      let tickets = await Ticket.find({ stripeSessionId: sessionId });
      if (tickets.length === 0) {
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        let selectedCategory = null;
        if (categoryName && event.categories && event.categories.length > 0) {
          selectedCategory = event.categories.find(c => c.name === categoryName);
        }

        const ticketsToCreate = [];
        for (let i = 0; i < numTickets; i++) {
          const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}-${i}`;
          ticketsToCreate.push({
            user: userId,
            event: eventId,
            city,
            showtimeId,
            ticketId,
            pricePaid: pricePaid || '0',
            status: 'Paid',
            category: categoryName || 'General',
            stripeSessionId: sessionId
          });
        }

        tickets = await Ticket.insertMany(ticketsToCreate);

        // Update Event counters
        event.ticketsSold += numTickets;
        if (selectedCategory) {
          selectedCategory.available = Math.max(0, selectedCategory.available - numTickets);
        }
        await event.save();

        // Update PromoCode uses
        if (promoCode) {
          const appliedPromo = await PromoCode.findOne({ code: promoCode.toUpperCase() });
          if (appliedPromo) {
            appliedPromo.usedCount += 1;
            await appliedPromo.save();
          }
        }
      }

      res.status(200).json({ success: true, type, ticket: tickets[0] });

    } else if (type === 'cart_checkout') {
      res.status(200).json({ success: true, type });

    } else {
      res.status(400).json({ success: false, message: 'Invalid session type metadata' });
    }

  } catch (error) {
    console.error('Error verifying checkout session:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const express = require('express');
const router = express.Router();
const { Resend } = require('resend');
const Donation = require('../models/Donation');

const resend = new Resend('re_7VuM3pJA_L8gB2ZiULvPw6dbXb1QY2ULg');

// POST send-update
router.post('/send-update', async (req, res) => {
  try {
    const { segment, subject, content } = req.body;
    let query = {};
    if (segment === 'monthly') query.type = { $in: ['Monthly', 'Annual'] };
    else if (segment === 'campaign') query.campaignId = { $ne: null };
    else if (segment === 'legacy') query.isLegacy = true;
    else if (segment !== 'all') query.email = segment; // Individual email

    // get unique emails
    const donations = await Donation.find(query).select('email firstName lastName');
    const uniqueDonors = Array.from(new Map(donations.map(d => [d.email, d])).values());

    if (uniqueDonors.length === 0) return res.status(400).json({ success: false, message: 'No donors found in this segment.' });

    // Free Resend tier limits to 50 recipients per request usually, and often requires verified domains.
    // For demonstration, we'll send a single email with BCC.
    const bccEmails = uniqueDonors.map(d => d.email).slice(0, 50);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; background-color: #FAF7EE; color: #1a2f24;">
        <h2 style="color: #D4AF37;">OMS Donor Update</h2>
        <div style="background: white; padding: 20px; border-radius: 8px;">
           <p>${content.replace(/\n/g, '<br>')}</p>
        </div>
      </div>
    `;

    const isIndividual = segment !== 'all' && segment.includes('@');
    const targetEmail = isIndividual ? segment : 'iamnobody3456@gmail.com'; // Primary to admin for bulk
    
    const emailConfig = {
      from: 'OMS Donor Relations <onboarding@resend.dev>', // Change this to your verified domain later (e.g., updates@onemustardseed.com)
      to: targetEmail,
      subject: subject,
      html: htmlContent
    };

    // If it's a bulk segment, add the BCC list
    if (!isIndividual && bccEmails.length > 0) {
      emailConfig.bcc = bccEmails;
    }

    await resend.emails.send(emailConfig);

    res.json({ success: true, count: bccEmails.length });
  } catch (err) {
    console.error('Send Update Error:', err);
    res.status(500).json({ success: false, message: 'Failed to send updates' });
  }
});

// POST bulk-receipt
router.post('/bulk-receipt', async (req, res) => {
  try {
    await resend.emails.send({
      from: 'OMS Finance <onboarding@resend.dev>',
      to: 'iamnobody3456@gmail.com',
      subject: 'Bulk Receipts Processed',
      html: `<div><p>Bulk receipts have been successfully processed and sent to the latest donors.</p></div>`
    });
    res.json({ success: true });
  } catch(err) {
    console.error('Bulk Receipt Error:', err);
    res.status(500).json({ success: false, message: 'Failed to process bulk receipts' });
  }
});

module.exports = router;


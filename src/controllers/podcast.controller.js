const PodcastSeason = require('../models/PodcastSeason');
const PodcastEpisode = require('../models/PodcastEpisode');

exports.getAllSeasons = async (req, res) => {
  try {
    const seasons = await PodcastSeason.find().sort({ createdAt: -1 });
    // Fetch episodes for each season to get the real count? Or just rely on episodesCount.
    // We'll just fetch all seasons
    res.json({ success: true, data: seasons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSeasonById = async (req, res) => {
  try {
    const season = await PodcastSeason.findById(req.params.id);
    if (!season) return res.status(404).json({ success: false, message: 'Season not found' });
    
    const episodes = await PodcastEpisode.find({ seasonId: season._id }).sort({ createdAt: 1 });
    res.json({ success: true, data: { ...season.toObject(), episodes } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSeason = async (req, res) => {
  try {
    const { title, description, status, image } = req.body;
    const season = new PodcastSeason({ title, description, status, image });
    await season.save();
    res.status(201).json({ success: true, data: season });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateSeason = async (req, res) => {
  try {
    const allowedFields = ['title', 'description', 'status', 'image', 'resources', 'spotifyUrl', 'applePodcastsUrl', 'isPremium'];
    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    }
    const season = await PodcastSeason.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!season) return res.status(404).json({ success: false, message: 'Season not found' });
    res.json({ success: true, data: season });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteSeason = async (req, res) => {
  try {
    const season = await PodcastSeason.findByIdAndDelete(req.params.id);
    if (!season) return res.status(404).json({ success: false, message: 'Season not found' });
    // Also delete episodes
    await PodcastEpisode.deleteMany({ seasonId: req.params.id });
    res.json({ success: true, message: 'Season deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createEpisode = async (req, res) => {
  try {
    const { title, seasonId, audioUrl, duration, description } = req.body;
    const episode = new PodcastEpisode({ title, seasonId, audioUrl, duration, description });
    await episode.save();

    // Update season episode count
    await PodcastSeason.findByIdAndUpdate(seasonId, { $inc: { episodesCount: 1 } });

    res.status(201).json({ success: true, data: episode });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateEpisode = async (req, res) => {
  try {
    const { title, audioUrl, duration, description } = req.body;
    const episode = await PodcastEpisode.findByIdAndUpdate(
      req.params.id,
      { title, audioUrl, duration, description },
      { new: true }
    );
    if (!episode) return res.status(404).json({ success: false, message: 'Episode not found' });
    res.json({ success: true, data: episode });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.recordListen = async (req, res) => {
  try {
    const episode = await PodcastEpisode.findByIdAndUpdate(
      req.params.id,
      { $inc: { listensCount: 1 } },
      { new: true }
    );
    if (!episode) return res.status(404).json({ success: false, message: 'Episode not found' });
    
    // Also increment season listen count
    await PodcastSeason.findByIdAndUpdate(episode.seasonId, { $inc: { listensCount: 1 } });
    
    res.json({ success: true, message: 'Listen recorded' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteEpisode = async (req, res) => {
  try {
    const episode = await PodcastEpisode.findByIdAndDelete(req.params.id);
    if (!episode) return res.status(404).json({ success: false, message: 'Episode not found' });
    
    // Update season episode count
    await PodcastSeason.findByIdAndUpdate(episode.seasonId, { $inc: { episodesCount: -1 } });

    res.json({ success: true, message: 'Episode deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Use Lead model for resource downloads
const Lead = require('../models/Lead');

exports.downloadResource = async (req, res) => {
  try {
    const { email, fileUrl } = req.body;
    if (email) {
      const existing = await Lead.findOne({ email });
      if (!existing) {
        await Lead.create({ 
          name: 'Podcast Listener', 
          email: email,
          resourceTitle: 'Podcast Resource Download' 
        });
      }
    }
    res.json({ success: true, url: fileUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

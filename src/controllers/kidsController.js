const KidsSeries = require('../models/KidsSeries');
const KidsEpisode = require('../models/KidsEpisode');
const Setting = require('../models/Setting');

// SERIES
exports.createSeries = async (req, res) => {
  try {
    const series = new KidsSeries(req.body);
    await series.save();
    
    if (series.trailer) {
      const introEpisode = new KidsEpisode({
        seriesId: series._id,
        title: req.body.trailerTitle || "Introduction",
        description: req.body.trailerDescription || "Series Introduction Video",
        vimeoLink: series.trailer,
        image: series.image,
        length: "00:00"
      });
      await introEpisode.save();
    }
    
    if (series.audioLink) {
      const audioIntroEpisode = new KidsEpisode({
        seriesId: series._id,
        title: req.body.audioTitle || "Audio Introduction",
        description: req.body.audioDescription || "Series Audio Introduction",
        audioLink: series.audioLink,
        image: series.image,
        length: "00:00"
      });
      await audioIntroEpisode.save();
    }
    
    res.status(201).json(series);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllSeries = async (req, res) => {
  try {
    const series = await KidsSeries.find().sort('-createdAt');
    // Attach real episode counts and total views
    const enriched = await Promise.all(
      series.map(async (s) => {
        const episodes = await KidsEpisode.find({ seriesId: s._id }, 'views');
        const count = episodes.length;
        const totalViews = episodes.reduce((sum, ep) => sum + (ep.views || 0), 0);
        return { ...s.toObject(), episodeCount: count, totalViews };
      })
    );
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getSeriesById = async (req, res) => {
  try {
    const series = await KidsSeries.findById(req.params.id);
    if (!series) return res.status(404).json({ message: 'Series not found' });
    res.json(series);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSeries = async (req, res) => {
  try {
    const series = await KidsSeries.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(series);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteSeries = async (req, res) => {
  try {
    await KidsSeries.findByIdAndDelete(req.params.id);
    await KidsEpisode.deleteMany({ seriesId: req.params.id });
    res.json({ message: 'Series and its episodes deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// EPISODES
exports.createEpisode = async (req, res) => {
  try {
    const episode = new KidsEpisode({ ...req.body, seriesId: req.params.seriesId });
    await episode.save();
    res.status(201).json(episode);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getEpisodesBySeries = async (req, res) => {
  try {
    const episodes = await KidsEpisode.find({ seriesId: req.params.seriesId }).sort('createdAt');
    res.json(episodes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEpisode = async (req, res) => {
  try {
    const episode = await KidsEpisode.findByIdAndUpdate(req.params.episodeId, req.body, { new: true });
    res.json(episode);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteEpisode = async (req, res) => {
  try {
    await KidsEpisode.findByIdAndDelete(req.params.episodeId);
    res.json({ message: 'Episode deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// VIEW TRACKING
// Called when a user starts playing an episode (video or audio)
exports.trackEpisodeView = async (req, res) => {
  try {
    const episode = await KidsEpisode.findByIdAndUpdate(
      req.params.episodeId,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!episode) return res.status(404).json({ message: 'Episode not found' });

    // Also increment the parent series view count
    await KidsSeries.findByIdAndUpdate(episode.seriesId, { $inc: { views: 1 } });

    res.json({ views: episode.views });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get total views for a series (sum of all episode views)
exports.getSeriesViews = async (req, res) => {
  try {
    const episodes = await KidsEpisode.find({ seriesId: req.params.id }, 'views');
    const totalViews = episodes.reduce((sum, ep) => sum + (ep.views || 0), 0);
    res.json({ totalViews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Analytics — for admin dashboard charts
exports.getAnalytics = async (req, res) => {
  try {
    const allSeries = await KidsSeries.find({}, 'name views');
    const allEpisodes = await KidsEpisode.find({}, 'title views seriesId').sort({ views: -1 }).limit(10);

    // Enrich each series with summed episode views
    const seriesAnalytics = await Promise.all(
      allSeries.map(async (s) => {
        const eps = await KidsEpisode.find({ seriesId: s._id }, 'views');
        const totalViews = eps.reduce((sum, ep) => sum + (ep.views || 0), 0);
        return { name: s.name, views: totalViews };
      })
    );
    seriesAnalytics.sort((a, b) => b.views - a.views);

    const totalViews = seriesAnalytics.reduce((sum, s) => sum + s.views, 0);

    // Enrich episodes with series names
    const seriesMap = {};
    allSeries.forEach(s => { seriesMap[s._id.toString()] = s.name; });

    const topEpisodes = allEpisodes.map(ep => ({
      title: ep.title,
      series: seriesMap[ep.seriesId?.toString()] || 'Unknown',
      views: ep.views || 0
    }));

    res.json({ totalViews, seriesAnalytics, topEpisodes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SETTINGS (Hero Banner)
exports.getKidsSettings = async (req, res) => {
  try {
    let setting = await Setting.findOne({ key: 'kidsHeroBanner' });
    if (!setting) {
      setting = new Setting({ key: 'kidsHeroBanner', value: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=2000' });
      await setting.save();
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateKidsSettings = async (req, res) => {
  try {
    const { value } = req.body;
    let setting = await Setting.findOne({ key: 'kidsHeroBanner' });
    if (!setting) {
      setting = new Setting({ key: 'kidsHeroBanner', value });
    } else {
      setting.value = value;
    }
    await setting.save();
    res.json(setting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DOWNLOADS
exports.downloadSampleGuide = (req, res) => {
  try {
    const content = `KidsBibleFlix Connection Guide
==============================
Series: Friendly Forest
Episode: 4

BIBLE FOCUS:
"But the fruit of the Spirit is love, joy, peace, forbearance, kindness..." - Galatians 5:22

CONVERSATION STARTERS:
• Why was Barnaby worried about sharing his supply?
• Can you name a time when someone shared something with you?
• How does God help us feel secure when we give?

FAMILY ACTIVITY:
This week, find one toy or item in your room that you can give away to someone who might need it more. Pray together before you give it away!`;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename="Friendly_Forest_Episode_4_Guide.txt"');
    res.send(content);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate download' });
  }
};

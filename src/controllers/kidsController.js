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
    
    res.status(201).json(series);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllSeries = async (req, res) => {
  try {
    const series = await KidsSeries.find().sort('-createdAt');
    // Attach real episode counts
    const enriched = await Promise.all(
      series.map(async (s) => {
        const count = await KidsEpisode.countDocuments({ seriesId: s._id });
        return { ...s.toObject(), episodeCount: count };
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

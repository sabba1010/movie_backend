const mongoose = require('mongoose');

const podcastSeasonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Active', 'Draft', 'Completed'],
    default: 'Active',
  },
  image: {
    type: String,
    default: '',
  },
  episodesCount: {
    type: Number,
    default: 0,
  },
  listensCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('PodcastSeason', podcastSeasonSchema);

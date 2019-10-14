const mongoose = require('../../database');

const ProbabilitySchema = new mongoose.Schema({
      userId: {
            type: String,
            require: true,
      },
      name: {
            type: String,
            require: true,
      },
      type: {
            type: String,
            require: true,
      },
      data: {
            type: Array,
            required: true,
      },
      results: {
            type: Array,
            require: true,
      },
      createdAt: {
            type: Date,
            default: Date.now,
      }
});

const Probability = mongoose.model('Probability', ProbabilitySchema);

module.exports = Probability;
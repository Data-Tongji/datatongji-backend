const mongoose = require('../../database');

const CorrRegSchema = new mongoose.Schema({
      userId: {
            type: String,
            require: true,
      },
      name: {
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

const CorrReg = mongoose.model('CorrReg', CorrRegSchema);

module.exports = CorrReg;
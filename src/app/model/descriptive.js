const mongoose = require('../../database');

const DescriptiveSchema = new mongoose.Schema({
    userId:{
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

const Descriptive = mongoose.model('Descriptive', DescriptiveSchema);

module.exports = Descriptive;
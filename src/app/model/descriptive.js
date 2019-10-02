const mongoose = require('../../database');

const DescriptiveSchema = new mongoose.Schema({

    userId:{
        type: String,
        require: true,
    },
    data: {
        type: Array,
        required: true,
    },
    varPesq: {
        type: String,
        require: true,
    },
    typeVar: {
        type: String,
        require: true,
    },
    dataDescriptive: {
        type: Array,
        required: true,
    },
    subType: {
        type: String,
        required: true,
        default: 'teste'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

// DescriptiveSchema.pre('save', async function(next) {
//     const hash = await bcrypt.hash(this.password, 10);
//     this.password = hash;

//     next();
// });

const Descriptive = mongoose.model('Descriptive', DescriptiveSchema);

module.exports = Descriptive;
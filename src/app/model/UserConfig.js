const mongoose = require('../../database');

const UserConfigSchema = new mongoose.Schema({
    userId: {
        type: String,
        require: true,
        select: false,
    },
    sidebarColor: {
        type: String,
        required: true,
        default: 'primary',
    }
});

const User = mongoose.model('UserConfig', UserConfigSchema);

module.exports = User;
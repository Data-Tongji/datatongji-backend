const mongoose = require('../../database');

const UserConfigSchema = new mongoose.Schema({
    userId: {
        type: String,
        require: true,
    },
    userName: {
        type: String,
        require: true,
    },    
    sidebarColor: {
        type: String,
        required: true,
        default: 'primary',
    },
    backgroundColor: {
        type: String,
        required: true,
        default: 'dark',
    },
    defaultLanguage: {
        type: String,
        required: true,
        default: 'en-us',
    }
});

const User = mongoose.model('UserConfig', UserConfigSchema);

module.exports = User;
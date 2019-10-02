const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://DaTaTonGjI:BBL3SXylimvM5oYO@datatongji-fvxg0.mongodb.net/dataTongji?retryWrites=true&w=majority', 
 {useMongoClient: true}
);

mongoose.Promise = global.Promise;

module.exports = mongoose;
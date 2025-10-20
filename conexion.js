const mongoose = require('mongoose');

const uri = 'mongodb+srv://Suonobases:12345@cluster0.xczq57n.mongodb.net/suono_logistic?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB Atlas'))
.catch(err => console.error('❌ Error al conectarse a la base de datos:', err.message));

module.exports = mongoose;
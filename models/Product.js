const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true },
  productId: { type: String, required: true, unique: true, match: /^#\d{6}$/ },
  descricao: { type: String, required: true, trim: true },
  planos: { type: [{ nome: { type: String, required: true, trim: true }, valor: { type: Number, required: true, min: 0.01 } }], default: [] },
  imagem: { type: String, trim: true }
});

module.exports = mongoose.model('Product', productSchema);
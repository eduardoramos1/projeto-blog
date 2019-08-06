const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categoria = new Schema({
    nome: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now() // default define um valor padrão caso não seja passado nenhum valor na hora da criação de um registro
    }
})

mongoose.model("categorias", categoria)
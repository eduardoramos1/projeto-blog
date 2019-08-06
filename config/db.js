//Verifica se a aplicação está em ambiente de produção
if(process.env.NODE_ENV == 'production'){
    module.exports = {
        mongoURI: 'mongodb+srv://eduardoramos1:eduardo1995@cluster0-ojls3.mongodb.net/test?retryWrites=true&w=majority'
    }
} else {
    module.exports = {
        mongoURI : 'mongodb://localhost/blog'
    }
}
const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const admin = require('./routes/admin');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
require('./models/Postagem')
require('./models/Categoria')
const Postagem = mongoose.model('postagens')
const Categoria = mongoose.model('categorias')
const usuarios = require('./routes/usuario')
const passport = require('passport')
require('./config/auth')(passport)
const db = require('./config/db')


const app = express();

//configs

//sessao
app.use(session({
    secret: 'treinoNode',
    resave: true,
    saveUninitialized: true
}));

//passport
app.use(passport.initialize());
app.use(passport.session());
//flash-connect
app.use(flash());

//middlewares
app.use((req, res, next) => {
    res.locals.successMsg = req.flash('successMsg')  //locals serve para criar variaveis globais
    res.locals.errorMsg = req.flash('errorMsg')
    res.locals.error = req.flash('error')
    res.locals.user = req.user || null
    next()
})
//body-parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
//handlebars
app.engine('handlebars', handlebars({
    defaultLayout:'main'
}));
app.set('view engine', 'handlebars');
//mongoose
mongoose.Promise = global.Promise;
mongoose.connect(db.mongoURI , { useNewUrlParser: true })
    .then(suc => console.log('Conectado ao banco de dados'))
    .catch(err => console.log('Erro ao conectar ao banco de dados' + err))
//public
//avisa para o express que todas os arquivos estaticos (como arquivos css/js) estao na pasta public
app.use(express.static(path.join(__dirname, 'public')));

//rotas

app.get('/', (req, res) => {
    Postagem.find().populate('categoria').sort({data:'desc'})
        .then( postagens => {
            res.render('index', {postagens})
        }).catch(err => {
             res.flash('errorMsg', 'Aconteceu um erro interno');
             res.redirect('/404')
        })
})

app.get('/postagem/:id', (req, res) => {
    Postagem.find({_id : req.params.id}).populate('categoria')
        .then(postagem => {
            if(postagem){
                res.render('postagem/leiamais', {postagem})
            }else{
                req.flash('errorMsg', 'Esta postagem não existe')
                res.redirect('/')
            }
        }).catch( err => {
            req.flash('errorMsg', 'Ops, aconteceu um erro!')
            res.redirect('/')
        })
})

app.get('/404', (req, res) => {
    res.send('Erro 404!')
})

app.get('/categorias', (req, res) => {
    Categoria.find()
        .then(categorias => {
            res.render('categorias/listacategorias', {categorias})
        }).catch( err => {
            req.flash('errorMsg', ' Houve um erro ao listar as categorias')
            res.redirect('/')
        })
})

app.get('/categorias/:slug',(req, res) => {
    Categoria.findOne({slug: req.params.slug}).then( categoria => {
        if(categoria){
            Postagem.find({categoria: categoria._id}).sort({data : 'desc'})
                .then(postagens => {
                    res.render('categorias/postagens', {postagens, categoria})
                }).catch(err => {
                    req.flash('errorMsg', 'Ocorreu um erro interno ao listar os posts!')
                    res.redirect('/')
                })
        }else{
            req.flash('errorMsg', 'Esta categoria não existe')
            res.redirect('/')
        }
    }).catch( err =>{
        req.flash('errorMsg', 'Não foi encontrada nada com este slug')
        res.redirect('/')
    })
})

    //quando uso um grupo de rotas, é possivel utilizar o 'use' passando um prefixo qualquer e referenciando a pagina que tem o grupo de rotas, no caso 'admin'
app.use('/admin', admin);
app.use('/usuarios', usuarios)

// -- para fazer o deploy na heroku depois
const PORT = process.env.PORT || 8080
app.listen(PORT, () => console.log('Servidor iniciado !'));
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
require('../models/Postagem')
const Categoria = mongoose.model('categorias');
const Postagem = mongoose.model('postagens');
//chamar a função de verificação do usuario, para ativar a função basta char 'eAdmin' nas rotas que eu quero proteger
const {eAdmin} = require('../helpers/eAdmin')



router.get('/', eAdmin, (req,  res) => {
    //vai na pasta views/admin e renderiza o arquivo 'index'
    res.render('admin/index')
});

router.get('/posts', eAdmin, (req, res) => {
    res.send('Página de posts')
})

router.get('/categorias', eAdmin, (req, res) => {
    //lista todos os documentos que existem no model Categoria, no caso todos os registros de categoria
    Categoria.find().sort({ date: 'desc' })
        .then(categorias => {
            res.render('admin/categorias', { categorias })
        }).catch(erro => {
            req.flash('errorMsg', 'Houve um erro ao listar as categorias');
            res.redirect('/admin');
        })


})

router.get('/categorias/add', eAdmin, (req, res) => {
    res.render('admin/addcategorias')
})

router.post('/categorias/nova', eAdmin, (req, res) => {

    //validação do formulário
    let erros = [];

    if (!req.body.nome) {
        erros.push({ texto: 'Nome inválido' })
    }

    if (!req.body.slug) {
        erros.push({ texto: 'Slug inválido' })
    }

    if (req.body.nome.length < 3) {
        erros.push({ texto: 'Nome da categoria muito curto, escolha um nome maior' })
    }

    if (erros.length > 0) {
        //renderizo a pagina 'addcategorias' e envio a variavel 'erros' para a pagina
        res.render('admin/addcategorias', { erros })
    } else {

        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(novaCategoria).save()
            .then(suc => {
                //successMsg e errorMsg foram definidas em app.js
                req.flash('successMsg', 'Categoria registrada com sucesso')
                res.redirect('/admin')
            })
            .catch(err => {
                req.flash('errorMsg', 'Houve um erro ao registrar a categoria')
                res.redirect('/admin')
            })
    }


})

router.get('/categorias/edit/:id', eAdmin, (req, res) => {
    Categoria.findOne({ _id: req.params.id })
        .then(categoria => {
            res.render('admin/editCategorias', { categoria })
        }).catch(err => {
            req.flash('errorMsg', 'Deu ruim!')
            res.redirect('/admin/categorias')
        })

});

router.post('/categorias/edit', eAdmin, (req, res) => {

    //validação do formulário de Edição
    let erros = [];

    if (!req.body.nome) {
        erros.push({ texto: 'Nome inválido' })
    }

    if (!req.body.slug) {
        erros.push({ texto: 'Slug inválido' })
    }

    if (req.body.nome.length < 3) {
        erros.push({ texto: 'Nome da categoria muito curto, escolha um nome maior' })
    }

    if (erros.length > 0) {
        //renderizo a pagina 'addcategorias' e envio a variavel 'erros' para a pagina
        res.render('admin/editCategorias', { erros })
    } else {

        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        Categoria.findOne({ _id: req.body.id })
            .then(categoria => {
                categoria.nome = req.body.nome;
                categoria.slug = req.body.slug;

                categoria.save().then(_ => {
                    req.flash('successMsg', ' Categoria editada! ')
                    res.redirect('/admin/categorias')
                }).catch(err => {
                    req.flash('errorMsg', 'Houve um erro ao tentar editar a categoria');
                    res.redirect('/admin/categorias')
                })
            })
            .catch(err => {
                req.flash('errorMsg', 'Houve um erro ao editar a categoria');
                res.redirect('/admin/categorias');
            })
    }
})

router.post('/categorias/deletar', eAdmin, (req, res) => {
    Categoria.deleteOne({ _id: req.body.id }).then(_ => {
        req.flash('successMsg', 'Categoria deletada com sucesso')
        res.redirect('/admin/categorias')
    }).catch(err => {
        req.flash('errorMsg', 'Houve um erro tentar deletar a categoria')
        res.redirect('/admin/categorias')
    })
})

router.get('/postagens', eAdmin, (req, res) => {
    Postagem.find().populate('categoria').sort({ data: 'desc' })
        .then(categorias => {
            res.render('admin/postagens', { categorias })
        }).catch(err => {
            req.flash('errorMsg', 'Houve um erro ao tentar listar as postagens')
            res.redirect('/admin')
        })

})

router.get('/postagens/add', eAdmin, (req, res) => {
    Categoria.find().then(categorias => {
        res.render('admin/addpostagem', { categorias })
    }).catch(err => {
        req.flash('errorMsg', 'Houve um erro ao criar a postagem')
        res.redirect('/admin')
    })

})

router.post('/postagens/nova', eAdmin, (req, res) => {
    //validação do formulário
    let erros = [];

    if (!req.body.titulo) {
        erros.push({ texto: 'Titulo inválido' })
    }

    if (!req.body.slug) {
        erros.push({ texto: 'Slug inválido' })
    }

    if (!req.body.descricao) {
        erros.push({ texto: 'Descrição  inválida!' })
    }

    if (!req.body.conteudo) {
        erros.push({ texto: 'Conteúdo  inválido!' })
    }

    if (!req.body.categoria || req.body.categoria == 0) {
        erros.push({ texto: 'Categoria  inválida! Se não existir nenhuma categoria, crie uma categoria!' })
    }

    if (erros.length > 0) {
        //renderizo a pagina 'addcategorias' e envio a variavel 'erros' para a pagina
        res.render('admin/addpostagem', { erros })
    } else {

        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Postagem(novaPostagem).save()
            .then(suc => {
                //successMsg e errorMsg foram definidas em app.js
                req.flash('successMsg', 'Categoria registrada com sucesso')
                res.redirect('/admin/postagens')
            })
            .catch(err => {
                req.flash('errorMsg', 'Houve um erro ao registrar a categoria')
                res.redirect('/admin')
            })
    }
})

router.get('/postagens/edit/:id', eAdmin, (req, res) => {
    Postagem.findOne({ _id: req.params.id })
        .then(postagem => {
            Categoria.find().then(categorias => {
                res.render('admin/editPostagens', { postagem, categorias })
            }).catch(err => {
                req.flash('msgErro', 'Houve um erro ao tentar listar as categorias')
                res.redirect('/admin/postagens')
            })


        }).catch(err => {
            req.flash('errorMsg', 'Deu ruim!')
            res.redirect('/admin/postagens')
        })

})

router.post('/postagens/edit', eAdmin, (req, res) => {
    //validação do formulário
    let erros = [];

    if (!req.body.titulo) {
        erros.push({ texto: 'Titulo inválido' })
    }

    if (!req.body.slug) {
        erros.push({ texto: 'Slug inválido' })
    }

    if (!req.body.descricao) {
        erros.push({ texto: 'Descrição  inválida!' })
    }

    if (!req.body.conteudo) {
        erros.push({ texto: 'Conteúdo  inválido!' })
    }

    if (!req.body.categoria || req.body.categoria == 0) {
        erros.push({ texto: 'Categoria  inválida! Se não existir nenhuma categoria, crie uma categoria!' })
    }

    if (erros.length > 0) {
        //renderizo a pagina 'addcategorias' e envio a variavel 'erros' para a pagina
        res.render('admin/postagens', { erros })
    } else {

        Postagem.findOne({_id : req.body.id})
            .then(postagem => {

                postagem.titulo = req.body.titulo
                postagem.slug = req.body.slug
                postagem.descricao = req.body.descricao
                postagem.conteudo = req.body.conteudo
                postagem.categoria = req.body.categoria

                postagem.save().then(_ => {
                    req.flash('successMsg', 'Post alterado com sucesso!')
                    res.redirect('/admin/postagens')
                }).catch( err => {
                    req.flash('errorMsg', 'Erro ao tentar alterar o post')
                    res.redirect('/admin/postagens')  
                })

            }).catch( err =>{
                req.flash('errorMsg', 'Falha ao editar post');
                res.redirect('/admin/postagens');
            })

    }
})

router.get('/postagens/deletar/:id', eAdmin, (req, res) => {
    Postagem.deleteOne({_id : req.params.id})
        .then( _ => {
            req.flash('successMsg', 'Removido com sucesso!')
            res.redirect('/admin/postagens')
        }).catch( err => {
            req.flash('errorMsg', 'Houve um erro ao tentar remover a postagem!')
            res.redirect('/admin/postagens')
        })
})

module.exports = router;
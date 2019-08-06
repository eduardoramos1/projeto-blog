const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Usuario');
const Usuario = mongoose.model('usuarios');
//para trabalhar com criptografia ( hasheamento):
const bcrypt = require('bcryptjs');
const passport = require('passport')

router.get('/registro', (req, res) => {
    res.render('usuarios/registro')
})

router.post('/registro', (req, res) => {
    let erros = [];
    if(!req.body.nome){
        erros.push({texto : 'nome inválido'})
    }
    if(!req.body.email){
        erros.push({texto : 'email inválido'})
    }
    if(!req.body.senha || req.body.senha.length < 4){
        erros.push({texto : 'Senha inválida! Necessário pelo menos 4 carácteres'})
    }
    if(!req.body.senha2 || req.body.senha != req.body.senha2){
        erros.push({texto : 'É necessário repetir a senha'})
    }
    if(erros.length > 0){
        res.render('usuarios/registro', {erros})
    } else{
        Usuario.findOne({email : req.body.email})
            .then(usuario => {
                if(usuario){
                    req.flash('errorMsg', 'Já existe uma conta cadastrada com este email');
                    res.redirect('/usuarios/registro')
                }else{
                    const novoUsuario = new Usuario({
                        nome: req.body.nome,
                        email: req.body.email,
                        senha: req.body.senha,
                    })
                    //salt é um valor aleatorio que se mistura com o hash para aumentar a segurança do item hasheado
                    bcrypt.genSalt(10, (erro, salt) => {
                        bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                            if(erro){
                                req.flash('errorMsg', 'Houve um erro durante o cadastro')
                                res.redirect('/')
                            }
                            else{
                                novoUsuario.senha = hash
                                novoUsuario.save().then( _ => {
                                    req.flash('successMsg', 'Usuário cadastrado com sucesso')
                                    res.redirect('/')
                                }).catch( err => {
                                    req.flash('errorMsg', 'Houve um erro ao tentar cadastrar, teste novamente!')
                                    res.redirect('/usuarios/registro')
                                })
                            }
                        })
                    })
                }
            }).catch( err => {
                req.flash('errorMsg', 'Houve um erro interno, tente novamente!');
                res.redirect('/');
            })
    }
})


router.get('/login', (req, res) => {
    res.render('usuarios/login');
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true,
    })(req, res, next)
})

router.get('/logout', (req, res) => {
    req.logout()
    req.flash('successMsg', 'Deslogado com sucesso')
    res.redirect('/')
})

module.exports = router;
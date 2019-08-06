//Arquivo para verificar se o usuario está autentica e ele é administrador e para travar acesso a rotas especificas
module.exports = {
    eAdmin: function(req, res, next){
        if(req.isAuthenticated() && req.user.admin == 1){
            return next();
        }

        req.flash('errorMsg', 'Você precisa de permissão para acessar esta área')
        res.redirect('/')
    }
}
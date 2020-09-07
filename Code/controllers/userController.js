const jsonDb = require('../db/jsonDb');
const usersModel = jsonDb('users');
const usersTokenModel = jsonDb("usersTokens");
const crypto = require("crypto")

const bcrypt = require("bcryptjs")

const { validationResult } = require("express-validator")

module.exports = {
    login: (req, res) => {
        res.render('./users/login');
    },

    registro: (req, res) => {
        res.render('./users/registro');
    },

    processLogin: (req, res) => {
        let errors = validationResult(req)
        // si no vinieron errores...
        if(errors.isEmpty()){
            // busco el usuario en la db
            let user = usersModel.findBy('email', req.body.email);

            // si el usuario existe y la contraseña es correcta
            if (user && bcrypt.compareSync(req.body.password, user.password) ) {
                // elimino la contraseña que vino en el req
                delete user.password
                // creo la sesion con el usuario
                req.session.user = user
                if(req.body.recordar){
                   const token = crypto.randomBytes(64).toString("base64");
                    usersTokenModel.createRow({ userId: user.id, token});
                    res.cookie("userToken", token, { maxAge: 1000 * 60 * 60 * 24 * 5})
                }
            
                // redirijo al inicio
                res.redirect("/")
            }
            // si hay error en los valores ingresados
            else {
                errors = {
                    login: 
                        {msg:'Por favor verifique los datos ingresados y vuelva a intentar'}
                };
                return res.render('./users/login', { errors });
            }
        }
        // si vinieron errores... 
        else {
        res.render("./users/login", {errors:errors.mapped()})
    }
    },

    logout: (req, res) => {
        // elimino la sesión del usuario        
        req.session.destroy();
        res.clearCookie("userToken");

        // redirijo al usuario al inicio
        return res.redirect('/');
    },

    createUser: (req, res) => {
        let errors = validationResult(req)
        // si no hay errores...
        if(errors.isEmpty()){
            // creo el nuevo usuario
            let newUser = {
                fname: req.body.nombre,
                lname: req.body.apellido,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, 10),
                avatar: req.file.filename
                }
            // lo guardo en db
            usersModel.createRow(newUser);
            // redirijo al login
            return res.redirect('/user/login');
        
        } 
        else { // si hay errores..
            // retorno los errores en la misma vista
            res.render("./users/registro", {errors:errors.mapped(), values: req.body}) 
        }
    }
}
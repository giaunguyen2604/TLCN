const bodyParser = require("body-parser");
const parser = bodyParser.urlencoded({extended:false});
const User = require("../models/users");
const passport = require("passport");
const passportfb = require("passport-facebook").Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const express = require("express");

module.exports = function(app,apiRouter,jwt){
    var username="", email="",token,role="";
    var superSecret = 'iamastudent';
    app.get("/",(req,res)=> res.render("trangchu",{username:username}))
    app.post("/signup",parser,(req,res)=>{
        const firstName = req.body.firstname;
        const lastName = req.body.lastname;
        const email = req.body.email;
        const phoneNumber = req.body.phonenumber;
        const password = req.body.password;
        const repass = req.body.repass;
        const dob = req.body.dob;
        var err="";
        if (!firstName || !lastName || !email || !password || !repass) {
            err = "Không được bỏ trống các trường bắt buộc (*)";
            return res.json(err);
        } else {
            if (password != repass) {
                err = "Xác nhận mật khẩu không khớp!"
                return res.json(err);
            } else {
                var user = new User();
                user.firstName = firstName;
                user.lastName = lastName;
                user.email = email;
                user.numberPhone = phoneNumber;
                user.password = password;
                user.dob = dob;
                console.log(user);
                user.save(function (err) {
                    if (err) {
                        if (err.code == 110000) {
                            return res.json("Email đã tồn tại!");
                        } else {
                            return res.json(err);
                        }
                    } else {
                        res.json("success");
                    }
                });
            }
        }
    });


    apiRouter.post("/login",parser,(req,res)=> {
        const emailorphone = req.body.EmailOrPhone;
        const password = req.body.password;
        User.findOne({$or:[
            {email:emailorphone},
            {numberPhone:emailorphone}
        ]}).select("email firstName lastName numberPhone dateofBirth password role").exec(function(err,user){
            if (err){
                res.send(err);
            } else {
                if (!user){
                    res.json({err:1,message:"Không đúng Email/SDT hoặc password"});
                } else {
                    var validPassword = user.comparePassword(password);
                    if (!validPassword){
                        res.json({err:1,message:"Không đúng Email/SDT hoặc password"});
                    } else {
                        var token = jwt.sign({
                            name: user.lastName,
                            email: user.email
                        },superSecret,{
                            expiresIn: "24h"
                        });
                        res.json({err:0,username:user.lastName,email:user.email,token:token,role:user.role});          
                    }
                }
            }
        });
    });

    apiRouter.use(function(req,res,next){
        var token = req.query.token || req.params.token;
        console.log(token);
        if (token){
            jwt.verify(token,superSecret,function(err,decoded){
                if (err){
                    return res.json({success:0,message:'Failed to authenticate token'});
                } else {
                    req.decoded = decoded;
                    next();
                }
            })
        } else {
            return res.status(403).send({
                success:0
            })
        }
    });

    apiRouter.get("/",(req,res)=>{
        res.send({success:1});
    });
    app.get("/logout",(req,res)=>{
        res.render("dangnhap");
    });

    app.get("/redirect",function(req,res){
        res.render("auth");
    })
    //authen with facebook
    app.use(passport.initialize());
    app.use(passport.session());
    app.get("/auth/fb", passport.authenticate('facebook', { scope: ['email'] }));
    app.get("/auth/fb/cb",function(req,res,next){
        passport.authenticate('facebook',function(err,user,info){
            if (err){
                return next(err);
            };
            if (!user){
                return res.redirect("/login");
            };
            username = user.lastName;
            email = user.email;
            token = jwt.sign({
                name: user.lastName,
                email: user.email
            },superSecret,{
                expiresIn: "24h"
            });
            return res.redirect("/redirect");
        })(req,res,next);
    });
    app.get("/success",function(req,res){
        res.json({username:username,email:email,token:token});
    })
    passport.use(new passportfb(
        {
            clientID: '910829922619157',
            clientSecret: '300b1e1b7435d99456cfe3c95e02f4ff',
            callbackURL: 'http://localhost:3000/auth/fb/cb',
            profileFields: ['email', 'gender', 'locale', 'displayName','first_name','last_name']
        },
        (accessToken, refreshToken, profile, done) => {
            console.log(profile);
            User.findOne({ id: profile._json.id }, (err, user) => {
                if (err) return done(err);
                if (user) return done(null, user);
                const newUser = {
                    id:profile._json.id,
                    email: profile._json.email,
                    firstName: profile._json.first_name,
                    lastName: profile._json.last_name,
                    numberPhone: "",
                    dob: "",
                    password:"12345678",
                }
                username = newUser.lastName;
                email = newUser.email;
                token = jwt.sign({
                    name: user.lastName,
                    email: user.email
                },superSecret,{
                    expiresIn: "24h"
                });
                User.create(newUser, (err, user) => {
                    if (err) return done(err);
                    console.log("Da qua dc");
                    return done(null, newUser);
                })
            })
        }
    ));
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        User.findOne({ id }, (err, user) => {
            done(null, user);
        });
    });

    //authen with google
    app.get("/auth/google/callback",function(req,res,next){
        passport.authenticate('google',function(err,user,info){
            if (err){
                return next(err);
            };
            if (!user){
                return res.redirect("/login");
            };
            return res.redirect("/redirect");
        })(req,res,next);
    })
    app.get('/auth/google',
        passport.authenticate('google', {
            scope: ['profile', 'email'],
            
        })
    );   
    passport.use(
        new GoogleStrategy(
            {
                clientID: '529498782265-of63hinvggfihtgmle4elacfheu0uitf.apps.googleusercontent.com',
                clientSecret: '5iMUHyS9iA45L0Es39JjbHsT',
                callbackURL: '/auth/google/callback'
            },
            (accessToken,refreshToken,profile,done) => {
                process.nextTick(function () {
                    console.log(profile);
                    User.findOne({ id: profile.id }, (err, user) => {
                        if (err) return done(err);
                        if (user) {
                            username = user.lastName;
                            email = user.email;
                            token = jwt.sign({
                                name: user.lastName,
                                email: user.email
                            },superSecret,{
                                expiresIn: "24h"
                            });
                            return done(null, user);
                        }
                        const newUser = {
                            id: profile.id,
                            email: profile.emails[0].value,
                            firstName: profile.name.familyName,
                            lastName: profile.name.givenName,
                            numberPhone: "",
                            dateofBirth: "",
                            password:"12345678",
                        }
                        console.log(newUser);
                        username = newUser.lastName;
                        email = newUser.email;
                        token = jwt.sign({
                            name: newUser.lastName,
                            email: newUser.email
                        },superSecret,{
                            expiresIn: "24h"
                        });
                        User.create(newUser, (err, user) => {
                            if (err) return done(err);
                            console.log("Da qua dc");
                            return done(null, newUser);
                        });
                    })              
                });
            }
        )
    );
    
    passport.serializeUser((user,done) => {
        done(null,user.id);
    });
    
    passport.deserializeUser((id,done) => {
        User.findOne({ id }, (err, user) => {
            done(null, user);
        });
    });
}
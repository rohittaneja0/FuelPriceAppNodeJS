const express = require('express');
const app = express();
var bodyParser = require("body-parser");
var expressValidator = require("express-validator");
var expressSession = require("express-session");
const passport = require('passport');
var mongoose = require('mongoose');
var mongo = require('mongodb').MongoClient;
var flash = require('connect-flash');
var User = require("./models/users");
var Profile = require("./models/profile");
var Quote = require("./models/quote");
var FuelQuoteServer = require('./FuelQuoteServer');
var LocalStrategy = require('passport-local');
var passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

mongoose.connect("mongodb://localhost/auth_demo_app", { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.static('views'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
app.use(bodyParser.json());
app.use(expressValidator());
app.use(expressSession({ secret: "rohittaneja", saveUninitialized: false, resave: false }));
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next){
    res.locals.message = req.flash("error");
    next();
});


passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const {
    PORT = 3000
} = process.env


app.set("view engine", "ejs");

app.get("/", function (req, res) {
    res.render("index.ejs");
});

app.get("/login", function (req, res) {
    res.render("home.ejs");
});

app.get("/profileManagement", isLoggedIn, function (req, res) {
    // var userProfile = req.user;

    User.findOne({ username: req.session.passport.user }, (err, user) => {
        if (user) {
            console.log(user.id);
        }
        Profile.findOne({ userID: user.id }, (err, profile) => {
            if (err) {
                console.log(err);
            } else if(!profile){
                return res.render("ProfileMan.ejs")
            }else{
                console.log("profile---------:",profile);
                return res.render("ProfileMan", { profile });
            }
        })
    })



    //res.render("ProfileMan.ejs", { userP: userProfile });
});

app.get("/quoteHistory", isLoggedIn, function (req, res) {
    
    User.findOne({username: req.session.passport.user}, async (err, user) => {
        if(user){
            Profile.findOne({userID: user.id}, (err,profile) => {
                if(!profile){
                    res.redirect('/profileManagement')
                }else {
                    Profile.findOne({userID: user.id}).populate('quotes').exec((err, q) => {
                        console.log("Q-------",q);
                        res.render('QuoteHistory', { users: q.quotes });
                    })
                }
            })

           
            
        }
    });
    // Quote.find(function (err, users) {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         res.render('QuoteHistory', { users: users });
    //         console.log(users);
    //     }
    // });


});

app.get("/register", function (req, res) {
    res.render("Register.ejs")
});

app.get("/quote", isLoggedIn, function (req, res, next) {
    // console.log(req.session);
    console.log(req.session);

    User.findOne({ username: req.session.passport.user }, (err, user) => {
        if (user) {
            console.log(user.id);
        }
        // Profile.find(function(err, users) {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         res.render('FuelQuote', { users: users });
        //         // console.log(users);
        //     }
        // });
        Profile.findOne({ userID: user.id }, (err, profile) => {
            if (err) {
                console.log(err);
            } else if(!profile){
                res.redirect('/profileManagement')
            }else {
                console.log("Profile-------",profile);

                res.render('FuelQuote', { profile });
            }
        })
    })

});

app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});


app.get('/pricing', function(req, res){
    let userName = req.userName;
    let gallonsRequested = req.gallonsRequested;
    let address = req.address;
    let deliveryDate = req.deliveryDate;
    var ProfileForPrice;

    User.findOne({ username: req.session.passport.user }, (err, user) => {
        if (user) {
            console.log(user.id);
        }
        // Profile.find(function(err, users) {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         res.render('FuelQuote', { users: users });
        //         // console.log(users);
        //     }
        // });
        Profile.findOne({ userID: user.id }, (err, profile) => {
            if (err) {
                console.log(err);
            }else {
                console.log(profile);
                ProfileForPrice = profile;
            }
        })
    })

    /*
    Current price per gallon = $1.50 (this is the price what distributor gets from refinery and it varies based upon crude price.
    But we are keeping it constant for simplicity
     */

    let currentPrice = 1.5;
    let locationFactor = 0.04; // 2% for Texas, 4% for out of state.

    if(ProfileForPrice.state === "TX")
        locationFactor = 0.02;

    let gallonRequestedFactor = 0.03;

    if(gallonsRequested > 1000)
        gallonRequestedFactor = 0.02; // 2% if more than 1000 Gallons, 3% if less

    let companyProfileFactor = 0.1; // always 10%
    let rateFluctuation = 0.03; // 4% for summer, 3% otherwise

    let date = FuelQuoteServer.dateFromString(deliveryDate);
    let season  = FuelQuoteServer.getSeasonFromDate(date);

    if(season === "summer")
        rateFluctuation = 0.04;

    // db.get_history(userName, function (error, rows) {
    //     if(error){
    //         http.send(res, 1, "Server internal error!");
    //         return;
    //     }

    //     let historyFactor = 0;

    //     if(rows.length > 0)
    //         historyFactor = 0.01;

    //     let margin = currentPrice * (locationFactor - historyFactor + gallonRequestedFactor + companyProfileFactor + rateFluctuation);
    //     let suggestedPricePerGallon = currentPrice + margin;


    //     let totalAmountDue = suggestedPricePerGallon * gallonsRequested;

    //     db.insert_history(userName, deliveryDate, suggestedPricePerGallon, totalAmountDue, gallonsRequested, address, function(error, rows) {
    //         if(error){
    //             http.send(res, 1, "Server internal error!");
    //             return;
    //         }

    //         let data = {
    //             suggestedPrice: suggestedPricePerGallon,
    //             totalAmountDue : totalAmountDue
    //         };

    //         http.send(res, global.ERROR_SUCCESS, "ok!", data);
    //     })
    // } )
});


app.get("/*", function (req, res) {
    res.send("Enter Valid URL!!");
});

app.post("/register", function (req, res, next) {
    req.body.username
    req.body.password
    User.register(new User({ username: req.body.username }), req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.render("Register", {message: err.message});
        }
        passport.authenticate("local")(req, res, function () {
            res.redirect("/login");
        });
    });

});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/profileManagement",
    failureRedirect: "/login",
    failureFlash: 'Invalid username or password.'
}), function (req, res) {
});


app.post("/profile", async function (req, res) {
    // User.findOne({ username: req.session.passport.user }, (err, user) => {
    //     if(user){
    //     var profile = { ...req.body, userID: user.id }
    //     console.log('PROFILE----:', profile);
    
    //     var myData = new Profile(profile);
    //     myData.save()
    //         .then(item => {
    //             console.log(myData);
    //             res.redirect('quote')
    //         })
    //         .catch(err => {
    //             res.status(400).send("unable to save to database");
    //         });
    //     }
    // });

    User.findOne({ username: req.session.passport.user }, async (err, user) => {
        if(user){
            var profile = { ...req.body };
            console.log('PROFILE----:', profile);
            // Profile.findOneAndUpdate({userID: user.id}, async(err,profile) => {
            //     if(!profile){
            //         var myData = new Profile(profile);
            //         console.log("myData--------", myData);
            //         myData.save()
            //             .then(item => {
            //                 console.log(myData);
            //                 res.redirect('quote')
            //             })
            //             .catch(err => {
            //                 res.status(400).send("unable to save to database");
            //             });
            //     }else {
            //         res.redirect('/quote')
            //     }
            // })
            const prof = await Profile.findOne({userID: user.id});
            if(prof){
                await Profile.findOneAndUpdate({userID: user.id}, {$set: profile})
                return res.redirect('quote')
            }else {
                profile.userID = user.id
                await Profile.create(profile);
                return res.redirect('quote')
            }
        }
    });

});

app.post("/quote", function (req, res) {
    User.findOne({ username: req.session.passport.user }, (err, user) => {

        var myData = new Quote(req.body);
        myData.save()
            .then(async item => {
                console.log('ITEM', item);
                const p = await Profile.findOne({ userID: user.id })
                let q = p.quotes;

                await Profile.findOneAndUpdate({ userID: user.id }, { $set: { quotes: [...q, item.id] } })
                res.redirect("quote");
            })
            .catch(err => {
                res.status(400).send("unable to save to database");
            });
    })

});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error","Please Login First!");
    res.redirect("/login");
}

var port = process.env.PORT || 3000;
app.listen(port, () => console.log(
    `http://localhost:${PORT}`
));

module.exports = app;



var express = require('express');
var router = express.Router();
const dotenv=require('dotenv').config();
const usermodal= require("./users");
const postmodel=require("./post");
const passport = require('passport');
const localStrategy=require("passport-local");
passport.use(new localStrategy(usermodal.authenticate()));
const upload = require("./multer");

router.get('/', function(req, res, next) {
  res.render('index',{nav:false,error:req.flash("error")});
});
router.get('/register', function(req, res, next) {
  res.render('register',{nav:false});
});

router.get('/add', isLoggedIn,async function(req, res, next) {
 const user= await usermodal.findOne({username:req.session.passport.user});
  res.render("add",{nav:true});
});

router.post('/createpost', isLoggedIn,upload.single("postimage"),async function(req, res, next) {
  const user= await usermodal.findOne({username:req.session.passport.user});
  const createdpost =await postmodel.create({
    user:user._id,
    title:req.body.title,
    description:req.body.description,
    image:req.file.filename
  })
  user.posts.push(createdpost._id);
  await user.save();
  res.redirect("/profile");
});

router.get('/profile',isLoggedIn,async function(req, res, next) {
 const user= 
 await usermodal
 .findOne({username:req.session.passport.user})
 .populate("posts");
  res.render('profile',{user,nav:true});
});

router.get('/show/posts',isLoggedIn,async function(req, res, next) {
  const user= 
  await usermodal
  .findOne({username:req.session.passport.user})
  .populate("posts");
   res.render('show',{user,nav:true});
 });

 router.get('/feed',isLoggedIn,async function(req, res, next) {
  const user=await usermodal.findOne({username:req.session.passport.user})
  const posts= await postmodel.find()
  .populate("user")
  res.render("feed",{user,posts,nav:true})
 });


router.post('/fileupload',upload.single("image") ,async function(req, res, next) {
 const user= await usermodal.findOne({username:req.session.passport.user})
 user.profileImagie=req.file.filename;
 await user.save();
 res.redirect("/profile");
});

router.post('/register', function(req, res, next) {
  const data= new usermodal({
    username: req.body.username,
    email:req.body.email,
    Birthdate:req.body.birthdate,
    name:req.body.fullname,
  })

  usermodal.register(data,req.body.password)
  .then(function(){
    passport.authenticate("local")(req,res,function(){
      res.redirect("/profile");
    })
  })
});

router.post('/login', passport.authenticate("local",{
  failureRedirect:"/",
  successRedirect:"/profile",
  failureFlash:true,
}),function(req, res, next) {
});

router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});
function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    next();
  }
  else{
    res.redirect("/");
  }
}

module.exports = router;

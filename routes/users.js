const mongoose = require("mongoose");
const plm=require("passport-local-mongoose");
const userSchema=mongoose.Schema({
    username:String,
    password:String,
    email:String,
    profileImagie:String,
    Birthdate:Date,
    name:String,
    boards:{type:Array,default:[]},
    posts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"post"
    }]
});

userSchema.plugin(plm);

module.exports =mongoose.model("user",userSchema);
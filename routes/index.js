const express = require("express")
const router = express.Router()
const{ ensureAuth, ensureGuest} =require("../middleware/auth")

const Article = require("../models/Article")


// Login/landing Page
//@route  GET /
router.get("/",ensureGuest,(req,res)=>
{
    res.render("login",{
        layout: "login"
    })
})

// dashboard
//@route  GET /dashboard
router.get("/dashboard",ensureAuth,async(req,res)=>
{
    try {
        const articles = await Article.find({user: req.user.id}).lean()
        res.render("dashboard",{
            name: req.user.firstName,
            articles
        })
    }
     catch (err) {
         console.error(err)
         res.render("error/500")
    }
})

module.exports = router
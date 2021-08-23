const express = require("express")
const router = express.Router()
const{ ensureAuth} =require("../middleware/auth")

const Article = require("../models/Article")


// Show/post page
//@route  GET /articles/add
router.get("/add",ensureAuth,(req,res)=>
{
    res.render("articles/add")
})

// Post request for adding
//@route  POST/articles
router.post("/",ensureAuth, async (req,res)=>
{
    try {
        req.body.user = req.user.id
        await Article.create(req.body)
        res.redirect("/dashboard")
    } catch (err) {
        console.error(err)
        res.render("error/500")
    }
})

// Show all posts
//@route  GET /articles
router.get("/",ensureAuth,async(req,res)=>
{
    try {
        const articles = await Article.find({status: "public"})
            .populate("user")
            .sort({createdAt: "desc"})
            .lean()
        res.render("articles/index",{
            articles
        })
    } catch (err) {
        console.error(err)
        res.render("error/500")
    }
})


// @desc    Show single article
// @route   GET /article/:id
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    let article = await Article.findById(req.params.id).populate('user').lean()

    if (!article) {
      return res.render('error/404')
    }

    if (article.user._id != req.user.id && article.status == 'private') {
      res.render('error/404')
    } else {
      res.render('articles/show', {
        article,
      })
    }
  } catch (err) {
    console.error(err)
    res.render('error/404')
  }
})


// Show edit page
//@route  GET /articles/edit/:id
router.get("/edit/:id",ensureAuth, async(req,res)=>
{
    try {
        const article = await Article.findOne({
          _id: req.params.id,
        }).lean()
    
        if (!article) {
          return res.render('error/404')
        }
    
        if (article.user != req.user.id) {
          res.redirect('/articles')
        } else {
          res.render('articles/edit', {
            article,
          })
        }
    } 
      catch (err) {
        console.error(err)
        return res.render('error/500')
    }
})


// Update article
// @route   PUT /articles/:id
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    let article = await Article.findById(req.params.id).lean()

    if (!article) {
      return res.render('error/404')
    }

    if (article.user != req.user.id) {
      res.redirect('/articles')
    } else {
      article = await Article.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      })

      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

//  Delete article
// @route   DELETE /articles/:id
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let article = await Article.findById(req.params.id).lean()

    if (!article) {
      return res.render('error/404')
    }

    if (article.user != req.user.id) {
      res.redirect('/articles')
    } else {
      await Article.remove({ _id: req.params.id })
      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    User articles
// @route   GET /articles/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const articles = await Article.find({
      user: req.params.userId,
      status: 'public',
    })
      .populate('user')
      .lean()

    res.render('articles/index', {
      articles,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})



module.exports = router
const express = require('express')

const mongoose = require('mongoose')
const methodOverride = require('method-override')
const expressSanitizer = require('express-sanitizer')
const bodyParser = require('body-parser')

const app = express()
//APP CONFIG*************************************
mongoose.connect('mongodb://localhost:27017/restfulblog', {useNewUrlParser: true})
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(expressSanitizer())
app.use(methodOverride('_method'))
// MONGOOSE SCHEMA*******************************
const blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
})

const Blog = mongoose.model('Blog', blogSchema)
//ROUTES*****************************************
app.get('/', (req, res) => {
    res.redirect('/blogs')
})
//INDEX ROUTE
app.get('/blogs', (req, res)=> {
    Blog.find({}, (err, result) => {
        if(err) {
            console.log(err)
        }else {
            res.render('index', {blogs: result})
        }
    })
})
// NEW ROUTE
app.get('/blogs/new', (req, res)=> {
    res.render('new')
})
//CREATE ROUTE
app.post('/blogs', (req, res) => {
    //create blog
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.create(req.body.blog, (err, newBlog) => {
        if(err) {
            res.render('new')
        }else {
            res.redirect('/blogs')
        }
    })
})
//SHOW ROUTE
app.get('/blogs/:id', (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if (err) {
            res.redirect('/blogs')
        }else {
            res.render('show', {blog: foundBlog})
        }
    })
})
// EDIT ROUTE
app.get('/blogs/:id/edit', (req, res) => {
    Blog.findById(req.params.id, (err, result) => {
        if(err) {
            res.redirect('/blogs')
        }else {
            res.render('edit', {blog: result})
        }
    })
})
//UPDATE ROUTE
app.put('/blogs/:id', (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.findByIdAndUpdate( req.params.id, req.body.blog,{useFindAndModify: false}, (err, updatedBlog) => {
        if (err) {
            res.redirect('/blogs')
        }else{
            updatedBlog.save()
            .then(() => {
                res.redirect('/blogs/' + req.params.id)
            })
            
        }
    })
})
//DELETE ROUTE
app.delete('/blogs/:id', (req, res) => {
    Blog.findByIdAndRemove(req.params.id,{useFindAndModify: false}, (err, result) => {
        if(err) {
            res.redirect('/blogs')
        }else{
            res.redirect('/blogs')
        }
    })
    
})



const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log('Server started')
})
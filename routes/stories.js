const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')

const Story = require('../models/Story')


// Show add page
// GET /stories/add
router.get('/add', ensureAuth, (req, res) => {
    res.render('stories/add')
})

// Process add form
// POST /stories
router.post('/', ensureAuth, async (req, res) => {
    try {
        req.body.user = req.user.id
        await Story.create(req.body)
        res.redirect('/dashboard')
    } catch (error) {
        console.error(error)
        res.render('error/500')
    }
})


// Show all stories
// GET /stories
router.get('/', ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({ status: 'public' })
            .populate('user') // populate with user info that is not part of the story
            .sort({ createdAt: 'desc' })
            .lean()

        res.render('stories/index', {
            stories,
        })
    } catch (error) {
        console.error(error)
        res.render('error/500')
    }
})

// Show edit page
// GET /stories/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
    const story = await Story.findOne({
        _id: req.params.id
    }).lean()

    if(!story){ // story not found
        return res.render('error/404')
    }

    if(story.user != req.user.id){ // story user != logged user
        res.redirect('/stories')
    } else {
        res.render('stories/edit', {
            story
        })
    }

})

// Update story
// PUT /stories/:id
router.put('/:id', ensureAuth, async (req, res) => {
    let story = await Story.findById(req.params.id).lean()

    if(!story) {
        return res.render('error/404')
    }

    if(story.user != req.user.id){ // story user != logged user
        res.redirect('/stories')
    } else {
        story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
            new: true,
            runValidators: true
        })

        res.redirect('/dashboard')
    }

})



module.exports = router
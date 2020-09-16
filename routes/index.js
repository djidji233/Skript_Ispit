const express = require('express')
const router = express.Router()

// Login (Main) page
// GET /
router.get('/', (req, res) => {
    res.render('login', {
        layout: 'login'
    })
})


// Dashboard
// GET /dashboard
router.get('/dashboard', (req, res) => {
    res.render('dashboard')
})

module.exports = router
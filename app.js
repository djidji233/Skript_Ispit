const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const dotenv = require('dotenv')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const connectDB = require('./config/db')


// Load config
dotenv.config({ path: './config/config.env' }) // global variables

// Passport config
require('./config/passport')(passport)

connectDB()

const app = express()

// Body parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Method override
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
}))

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// Handlebars Helpers
const { formatDate, truncate, stripTags, editIcon, select } = require('./helpers/hbs')

// Handlebars (wrapper layout for html)
app.engine(
    '.hbs', 
    exphbs({
        helpers: {
            formatDate,
            truncate,
            stripTags,
            editIcon,
            select,
        }, 
        defaultLayout: 'main', 
        extname: '.hbs'
    })
);
app.set('view engine', '.hbs');

// Session middleware
app.use(session({
    secret: 'supersecret big secret',
    resave: false, // don't save a session if nothing is modified
    saveUninitialized: false, // don't create a session until something is stored
    store: new MongoStore({ mongooseConnection: mongoose.connection }) // session save (reload bug)
}))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Set global variable for logged user to be reached in templates
app.use(function(req, res, next) {
    res.locals.user = req.user || null
    next()
})

// Static folder
app.use(express.static(path.join(__dirname, 'public')))

//Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))

const PORT = process.env.PORT || 3000

app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
)
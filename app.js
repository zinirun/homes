const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const cors = require('cors');
const logger = require('morgan');

class App {
  constructor() {
    this.app = express();
    this.setViewEngine();
    this.setMiddleWare();
    this.setStatic();
    this.setLocals();
    this.getRouting();
    this.errorHandler();
  }

  setMiddleWare() {
    // HTTP -> HTTPS Redirection
    this.app.use((req, res, next) => {
      if (req.secure) {
        next();
      } else {
        const to = `https://${req.hostname}${req.url}`;
        res.redirect(to);
      }
    });
    this.app.use(logger('dev'));
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(cookieParser());
    this.app.use(
      expressSession({
        secret: 'my key',
        resave: true,
        saveUninitialized: true,
      }),
    );
    this.app.use(cors());
  }

  setViewEngine() {
    this.app.set('view engine', 'ejs');
    this.app.set('views', './public');
    this.app.engine('html', require('ejs').renderFile);
  }

  setStatic() {
    this.app.use('/public', express.static(__dirname + '/public'));
    // PKI KEY (DSV)
    this.app.use('/.well-known', express.static(__dirname + '/.well-known'));
  }

  setLocals() {
    this.app.use((req, res, next) => {
      this.app.locals.isLogin = true;
      next();
    });
  }

  getRouting() {
    this.app.use(require('./controllers'));
  }

  errorHandler() {
    this.app.use((req, res, _) => {
      res.status(404).render('404.html');
    });

    this.app.use((err, req, res, _) => {
      res.status(500).render('404.html');
    });
  }
}

module.exports = new App().app;

const express = require('express')
const bodyParser = require('body-parser')
const conf = require('./config')
const app = express()
const path = require('path')
const fetch = require('node-fetch')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

//fetch('https://github.com/login/oauth/authorize?client_id=' +
  //conf.id+ '&redirect_uri=http://localhost:3000/github/callback'+
 //'&scope=user:email&state=1234')

app.get('/github/callback', (req, res) => {
  fetch('https://github.com/login/oauth/access_token',
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: conf.github.id,
        client_secret: conf.github.secret,
        code: req.query.code,
        redirect_uri: 'http://localhost:3000/github/callback'
      })
    }
  ).then(resp => resp.json())
  .then(json => fetch('https://api.github.com/user?access_token='
    +json.access_token,{
      headers: {
        Accept: 'application/json',
      }
    })
  .then(resp => resp.json())
  .then(json => (console.log(json), 
    res.redirect('/welcome/'+(json.name || json.username))))
  )
})

app.get('/welcome/:name', (req, res) => 
  res.sendFile(path.resolve(__dirname+'/welcome.html')))

app.get('/', (req, res) => 
  res.sendFile(path.resolve(__dirname+'/index.html')))

app.listen(3000)

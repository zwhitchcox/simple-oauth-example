const express = require('express')
const bodyParser = require('body-parser')
const conf = require('./config')
const app = express()
const path = require('path')
const fetch = require('node-fetch')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

app.get('/github/callback', (req, res) => 
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
  .catch(e => (console.log(e), res.status(403).end('Not Authorized')))
)
app.get('/google/callback', (req, res) => {
  fetch('https://www.googleapis.com/oauth2/v4/token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: serialize({
      code: req.query.code,
      client_id: conf.google.id,
      client_secret: conf.google.secret,
      redirect_uri: 'http://localhost:3000/google/callback',
      grant_type: 'authorization_code',
    })
  })
  .then(resp => resp.json())
  .then(json => fetch('https://www.googleapis.com/plus/v1/people/me', {
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + json.access_token
    }
  }))
  .then(resp => resp.json())
  .then(json => (console.log(json), 
    res.redirect('/welcome/'+(json.displayName || json.username))))
  .catch(e => (console.log(e), res.status(403).end('Not Authorized')))
}
)

app.get('/welcome/:name', (req, res) => 
  res.sendFile(path.resolve(__dirname+'/welcome.html')))

app.get('/', (req, res) => 
  res.sendFile(path.resolve(__dirname+'/index.html')))

app.listen(3000)
//body: 'code=' + req.query.code +
  //'&client_id=' + conf.google.id +
  //'&client_secret=' + conf.google.secret + 
  //'&redirect_uri=http://localhost:3000/google/callback'+
  //'&grant_type=authorization_code',
function serialize(obj) {
  var str = [];
  for(var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}

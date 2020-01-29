require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const MOVIEDATA = require('./moviedata.json');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
app.use(helmet());
app.use(cors());

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting))

app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')
  
    if (!authToken || authToken.split(' ')[1] !== apiToken) {
      return res.status(401).json({ error: 'Unauthorized request' })
    }
    // move to the next middleware
    next()
  })

function getMovies(req, res) {
    let response = MOVIEDATA;
    if(req.query.genre) {
        response = response.filter(moviedata => 
          moviedata.genre.toLowerCase().includes(req.query.genre.toLowerCase()) 
        )
    }
    if(req.query.country) {
        response = response.filter(moviedata => 
          moviedata.country.toLowerCase().includes(req.query.country.toLowerCase()) 
        )
    }
    if(req.query.avg_vote) {
        const number = Number(req.query.avg_vote);
        response = response.filter(moviedata => 
            moviedata.avg_vote >= number
        )
      }
    res.send(response);
}

app.use((error, req, res, next) => {
  let response
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }}
  } else {
    response = { error }
  }
  res.status(500).json(response)
})


app.get('/movie', getMovies) 


const PORT = process.env.PORT || 8000


app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})
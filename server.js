const express = require('express')
const app = express();
const mysql = require('mysql');
const bcrypt = require('bcrypt');

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 


// <----------------------- MySQL Connection Part ----------------------->
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "movies_db"
});
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});



//  <----------------------- API Part ----------------------->

app.get('/movies/getallmovies', (req, res) => {
  // res.send(req);
  con.query("SELECT * FROM movies", function (err, result, fields) {
    if (err) throw err;

    res.json(result);
  });
})

app.post('/movies/addmovie', (req, res) => {
	var title = req.body.title;
	var year_release = req.body.year_release;
	var rating = req.body.rating;

	if (typeof title === 'undefined' || typeof year_release === 'undefined' || typeof rating === 'undefined'){
		res.status(200).json({'status':'invalid parameter'});
		return;
	}

  	var sql = "INSERT INTO movies (title, year_release, rating) VALUES ?";
  	con.query(sql, [[[title, year_release,rating]]], function (err, result) {
    	if (err) throw err;

    	res.status(200).json({'status':'success'});
  	});
})

app.post('/movies/deletemovie', (req, res) => {
	var id = req.body.id;

	if (typeof id === 'undefined' ){
		res.status(200).json({'status':'invalid parameter'});
		return;
	}

  	var sql = "DELETE FROM movies WHERE id = ?";
  	con.query(sql, [id], function (err, result) {
    	if (err) throw err;
    	res.status(200).json({'status':'success'});
  	});
})

app.post('/users/login', (req, res) => {
	var username = req.body.username;
	var password = req.body.password;
	
	if (typeof username === 'undefined' || typeof password === 'undefined'){
		res.status(200).json({'status':'invalid parameter'});
		return;
	}

  	var sql = "SELECT * FROM users WHERE username = ? LIMIT 1";
  	con.query(sql,[username], function (err, result, fields) {
    	if (err) throw err;

    	if (result.length === 0) {
    		res.status(200).json({'status':'invalid username'});
    	}else{
    		var password_encrypt = result[0].password;
		    if(bcrypt.compareSync(password, password_encrypt)) {
				res.status(200).json({'status':'success','username':result[0].username,'usertype':result[0].type});
			}else {
				res.status(200).json({'status':'invalid password'});
			}
    	}
		

  	});
})

app.post('/users/register', (req, res) => {
	var username = req.body.username;
	var password = req.body.password;
	var type = req.body.type;

	if (typeof username === 'undefined' || typeof password === 'undefined' || typeof type === 'undefined'){
		res.status(200).json({'status':'invalid parameter'});
		return;
	}

	let password_encrypt = bcrypt.hashSync(password, 10);
	var query_sql = "SELECT * FROM users WHERE username = ?";
  	var insert_sql = "INSERT INTO users (username, password, type) VALUES ?";

  	con.query(query_sql,[username], function (err, result, fields) {
  		if (result.length === 0) {
		  	con.query(insert_sql, [[[username, password_encrypt, type]]], function (err, result) {
		    	if (err) throw err;
		    	res.status(200).json({'status':'success'});
		  	});
		} else{
			res.status(200).json({'status':'duplicate username'});
		}

	});
})	




app.listen(3000, () => {
  console.log('Start server at port 3000.')
})
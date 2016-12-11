



// Dependencies:
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

var request = require("request");
var cheerio = require("cheerio");

var Promise = require("bluebird");

mongoose.Promise = Promise;




var app = express();


app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));


app.use(express.static("public"));


mongoose.connect("mongodb://localhost/scrape");
var db = mongoose.connection;


db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});


db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// Routes
// ======
app.get("/", function(req, res) {
  res.send(index.html);
});


app.get("/scrape", function(req, res) {
  request("https://news.ycombinator.com/", function(error, response, html) {  
    var $ = cheerio.load(html); 
    $("td.title").each(function(i, element) {     
      var result = {};
   


result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");



var entry = new Article(result);
      var entry = new Article(result);
        entry.save(function(err, doc) {      
        if (err) {
          console.log(err);
        }        
        else {
          console.log(doc);
        }
      });

    });
  });




app.get("/articles", function(req, res) {
  Article.find({}, function(error, doc) {
    if (error) {
      console.log(error);
    } 
    else {
      res.json(doc);
    }
  });
});


app.get("/articles/:id", function(req, res) {
Article.findOne({ "_id": req.params.id })
.populate("note")
.exec(function(error, doc) {
if (error) {
      console.log(error);
    }    
    else {
      res.json(doc);
    }
  });
});



app.post("/articles/:id", function(req, res) {  
  var newNote = new Note(req.body); 
  newNote.save(function(error, doc) {   
    if (error) {
      console.log(error);
    }    
    else {      
      Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
           .exec(function(err, doc) {       
        if (err) {
          console.log(err);
        }
        else {          
          res.send(doc);
        }
      });
    }
  });
});

app.listen(3000, function() {
  console.log("App running on port 3000!");
});


















/*
// First, tell the console what server.js is doing
console.log("\n***********************************\n" +
            "Grabbing every thread name and link\n" +
            "from reddit's webdev board:" +
            "\n***********************************\n");




// Making a request call for reddit's "webdev" board. The page's HTML is saved as the callback's third argument
request("https://news.ycombinator.com/", function(error, response, html) {

  // Load the HTML into cheerio and save it to a variable
  // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
  var $ = cheerio.load(html);

  // An empty array to save the data that we'll scrape
  var result = [];

  // With cheerio, find each p-tag with the "title" class
  // (i: iterator. element: the current element)
  $("td.title").each(function(i, element) {

    // Save the text of the element (this) in a "title" variable
    

    // In the currently selected element, look at its child elements (i.e., its a-tags),
    // then save the values for any "href" attributes that the child elements may have
    var link = $(element).children().attr("href");

    // Save these results in an object that we'll push into the result array we defined earlier
    result.push({
      title: title,
      link: link
    });
    // db.scrapedData.insert({
    //   title: title,
    //   link: link
    // })
  });

  // Log the result once cheerio analyzes each of its selected elements
  console.log(result);
});
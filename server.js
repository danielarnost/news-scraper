var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

var request = require("request");
var cheerio = require("cheerio");
var Promise = require("bluebird");
var PORT = process.env.PORT || 3000;

mongoose.Promise = Promise;



var app = express();


app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));


app.use(express.static("public"));


mongoose.connect("mongodb://heroku_1387c058:rnsfbt3rvq7pcst27e0tonthg6@ds133158.mlab.com:33158/heroku_1387c058");
var db = mongoose.connection;


db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});


db.once("open", function() {
    console.log("Mongoose connection successful.");
});


// Routes

app.get("/", function(req, res) {
    res.send(index.html);
});


app.get("/scrape", function(req, res) {

    request('https://news.ycombinator.com/', function(error, response, html) {

        var $ = cheerio.load(html);

        $(".title").each(function(i, element) {

            var result = {};


            result.title = $(this).children("a").text();
            result.link = $(this).children("a").attr("href");


            var entry = new Article(result);


            entry.save(function(err, doc) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(doc);
                }
            });

        });
    });
    res.send("Scrape Complete");
});


app.get("/articles", function(req, res) {
    Article.find({}, function(error, doc) {
        if (error) {
            console.log(error);
        } else {
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
            } else {
                res.json(doc);
            }
        });
});

//notes==================================================

app.post("/articles/:id", function(req, res) {

    var newNote = new Note(req.body);


    newNote.save(function(error, doc) {

        if (error) {
            console.log(error);
        } else {

            Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })

            .exec(function(err, doc) {

                if (err) {
                    console.log(err);
                } else {

                    res.send(doc);
                }
            });
        }
    });
});

// app.get("/delete/:id", function(req, res) {
//   // Remove a note using the objectID
//   db.notes.remove({
//     "_id": mongojs.ObjectID(req.params.id)
//   }, function(error, removed) {
//     // Log any errors from mongojs
//     if (error) {
//       console.log(error);
//       res.send(error);
//     }
//     // Otherwise, send the mongojs response to the browser
//     // This will fire off the success function of the ajax request
//     else {
//       console.log(removed);
//       res.send(removed);
//     }
//   });
// });



app.listen(PORT, function() {
    console.log("App running on port 3000!");
});

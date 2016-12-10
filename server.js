/* Scraper: Server #1  (18.2.1)
 * ========================= */

// Dependencies:

// Snatches HTML from URLs
var request = require("request");
// Scrapes our HTML
var cheerio = require("cheerio");
var db = mongojs(databaseUrl, collections);
db.on('error', function(err) {
  console.log('Database Error:', err);
});

// First, tell the console what server.js is doing
console.log("\n***********************************\n" +
            "Grabbing every thread name and link\n" +
            "from reddit's webdev board:" +
            "\n***********************************\n");


// Making a request call for reddit's "webdev" board. The page's HTML is saved as the callback's third argument
request("https://news.ycombinator.com/", function(error, response, html) {


  var $ = cheerio.load(html);


  var result = [];

  $("td.title").each(function(i, element) {


    var title = $(this).text();


    var link = $(element).children().attr("href");


    result.push({
      title: title,
      link: link
    });
    db.scrapedData.insert({
      title: title,
      link: link
    })
  });

 
  console.log(result);
});

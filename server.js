var http = require('http');
var parse = require('url').parse;
var fs = require('fs');
// querystring has a parse method to convert request strings to objects
var qs = require('querystring');

var items = [];

var server = http.createServer(function (req, res) {
   switch(req.method) {
      case 'GET':
         // body here is the equivalent of an index.html with embedded cs & js 
         // don't have to worry about supporting external files
         // have to put the whole thing in quotes
         var body = "<!DOCTYPE html>"
            + "<html>"
               + "<head>"
                  + "<title>Shopping List</title>"
                  // css to style the page 
                  + "<style>"
                     + "body, button { color: #686B6B; font-family: sans-serif; font-size: 1em; font-weight: 400; }"
                     + "input { color: #686B6B; font-family: sans-serif; font-size: 1em; font-weight: 400; padding: 4px; }"
                     + "h2 { font-weight: 700; margin-bottom: 20px; margin-top: 50px; }"
                     + ".container { margin: 0px auto; width: 90%; }"
                     + ".sendPost { background-color: #087EFF; border: none; color: #fff; height: 30px; margin-left: 5px; padding: 1px 1px 0 1px; width: 100px; }"
                     + ".list { background-color: #e3e3e3; height: auto; margin-top: 36px; padding: 3px 20px 10px; width: 400px; }"
                     + "#inputItem { margin-bottom: 4px; }" 
                     + "#putItem { background-color: #666; border: none; color: #fff; float: right; margin: -32px 38px 0 0; padding: 6px 6px; width: 90px; }"
                     + "#delItem { background-color: #ff6464; border: none; color: #fff; float: right; margin: -32px 2px 0 0; padding: 6px 10px; }" 
                  + "</style>"
               + "</head>"
               + "<body>"
                  + "<div class='container'>"
                     + "<h2>Shopping List</h2>"
                     + "<form action='/' method='post'>"
                        + "<input type='text' name='item' placeholder='Enter an item' autofocus>"
                        + "<button class='sendPost'>Add Item</button>"
                     + "</form>"
                     + "<div class='list'>"
                        + "<p>My shopping list:</p>"
                        + "<div id='shopList'></div>"
                     + "</div>"
                  + "</div>"
                  // using jQuery to send AJAX calls for DELETE & PUT 
                  + "<script src='//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js'></script>"
                  + "<script type='text/javascript'>"
                     // this variable supports adding the POST item to the input field
                     + "var input = $('#inputItem');"
                     + "var output = '<ol>';"
                     + "var items = " + JSON.stringify(items) + ";"
                     + "for (var i = 0; i < items.length; i++) {"
                        + "output += '<li id=\"inputItem\">' +"
                           // using an input field to allow each POST to be edited to support PUT updates
                           + "'<input type=\"text\" name=\"newItem\" id=\"inputItem\" value=\"' + items[i] + '\" />' +"
                           // form for the delete button
                           + "'<form action=\"/' + i + '\" method=\"delete\"><button id=\"delItem\">x</button></form>' +"
                           // form for the update button 
                           + "'<form action=\"/' + i + '\" method=\"put\"><button id=\"putItem\">Update</button></form></li>';"
                     + "}"
                     + "output += '</ol>';"
                     + "document.getElementById('shopList').innerHTML = output;"
                     + "$(document).ready(function() {"
                        // ajax DELETE request
                        + "$('form[method=\"delete\"]').on('submit', function(e) {"
                           + "e.preventDefault();"
                           + "$.ajax({ url: $(this).attr('action'),"
                                    + "type: $(this).attr('method').toUpperCase(),"
                                    // success method refreshes the screen after the ajax request 
                                    + "success: function() { window.location.reload(true); }});"
                        + "});"
                        // ajax PUT request
                        + "$('form[method=\"put\"]').on('submit', function(e) {"
                           + "e.preventDefault();"
                           + "$.ajax({ url: $(this).attr('action'),"
                                    + "type: $(this).attr('method').toUpperCase(),"
                                    // data sent to the server as the update request from the input field (name of newItem)
                                    + "data: { newItem: $(e.target).parent().find('input[name=\"newItem\"]').val() },"
                                    + "success: function() { window.location.reload(true); }});"
                        + "});"
                     + "});"
                  + "</script>"
               + "</body>"
            + "</html>";
         res.writeHead(200, {
            'Content-Length': body.length,
            'Content-Type': 'text/html'
         });
         res.end(body);
      break;
      case 'POST':
         var item = '';
         req.setEncoding('utf8');
         req.on('data', function(chunk){
            item += chunk;
         });
         req.on('end', function(){
            // use qs.parse to eliminate the "item="
            items.push(qs.parse(item).item);
            console.log('added ' + qs.parse(item).item);
            res.writeHead(303, { 'location': '/', });
            res.end();
         });
      break;
      case 'DELETE':
         var pathname = parse(req.url).pathname;
         var i = parseInt(pathname.slice(1), 10);
         var item = items[i];
         console.log('deleted ' + item);
         items.splice(i, 1);
         res.writeHead(303, { 'location': '/', });
         res.end();
      break;
      case 'PUT':
         var pathname = parse(req.url).pathname;
         var i = parseInt(pathname.slice(1), 10);
         var item = items[i];
         var body = '';
         req.on('data', function (chunk) {
            body += chunk;
         });
         req.on('end', function(){
            var data = qs.parse(body);
            if(data && data.newItem) {
                items[i] = data.newItem;
                console.log('updated ' + item + ' to ' + data.newItem);
            }
            res.writeHead(303, { 'location': '/', });
            res.end();
         });
      break;
   }
});

var port = process.env.PORT || 3000;
server.listen(port, function(){
   console.log('listening on ' + port);
});

// jshint esversion: 6
const http = require('http');
const fs = require('fs');
const PORT = process.env.PORT || 3000;
const qs = require('querystring');

const fileNotFoundErrorHandler = (res) => {
  res.statusCode = 500;
  res.end('Server is broken\n');
};

const sendContent = (res, content) => {
  res.setHeader('Content-Type', 'text/html');
  res.write(content);
  res.end('\nPeace out, yo\n');
};

const server = http.createServer( (req, res) => {
  let theUrl = req.url.slice(1);
  // console.log(req.url);
  // console.log('req url', theUrl);
  // console.log('req method', req.method);
  // console.log('req headers', req.headers);

  if ( req.method === 'POST' && req.url === '/elements') {
    let reqBody = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      reqBody += chunk;
    });

    req.on('end', () => {
      bodyQS = qs.parse(reqBody);
      let newHTMLFile = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Elements - ${bodyQS.elementName}</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <h1>${bodyQS.elementName}</h1>
  <h2>${bodyQS.elementSymbol}</h2>
  <h3>Atomic number ${bodyQS.elementAtomicNumber}</h3>
  <p>${bodyQS.elementDescription}</p>
  <p><a href="/">back</a></p>
</body>
</html>`;


      fs.readdir('./public', (err, files) => {
        if (files.indexOf(`${bodyQS.elementName.toLowerCase()}.html`) < 0 ) {
          fs.writeFile(`./public/${bodyQS.elementName.toLowerCase()}.html`, `${newHTMLFile}`, (err) => {
            if (err) {
              fileNotFoundErrorHandler(res);
            }
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.write('{ "success" : true }');
            res.end();
            return;
          });
        } else {
          res.statusCode = 403;
          res.end('File already exists');
          return;
        }
      });

    });
  } else if ( theUrl === 'css/styles.css' && req.method === 'GET') {
    fs.readFile('./public/css/styles.css', (err, data) => {
      if (err) {
        fileNotFoundErrorHandler(res);
      } else {
        sendContent(res, data);
      }
    });
  } else {
    fs.readdir('./public', (err, files) => {
      console.log(files);
      if ( files.indexOf(theUrl) > 0 ) {
        fs.readFile(`./public/${theUrl}`, {encoding: 'utf8'}, (err, data) => {
          if (err) {
            fileNotFoundErrorHandler(res);
          }
          sendContent(res, data);
          console.log(data);
        });
      } else {
        res.statusCode = 404;
        res.write('Invalid Url\n');
        res.end();
      }
    });
  }



});


  // let reqBody = '';
  // req.setEncoding('utf8');
  // req.on('data', (chunk) => {
  //   reqBody += chunk;
  // });
  // req.on('end', () => {
  //   //reqBody is complete, handle request!
  //   bodyQS = qs.parse(reqBody);
  // let newHTMLFile = `<!DOCTYPE html>
  // <html lang="en">
  // <head>
  //   <meta charset="UTF-8">
  //   <title>The Elements - ${bodyQS.elementName}</title>
  //   <link rel="stylesheet" href="/css/styles.css">
  // </head>
  // <body>
  //   <h1>${bodyQS.elementName}</h1>
  //   <h2>${bodyQS.elementSymbol}</h2>
  //   <h3>Atomic number ${bodyQS.elementAtomicNumber}</h3>
  //   <p>${bodyQS.elementDescription}</p>
  //   <p><a href="/">back</a></p>
  // </body>
  // </html>`;




server.listen(PORT, () => {
  console.log('server is listening on port', PORT);
});
const fs = require('fs');
const http = require('http');
const url = require('url');

const slugify = require('slugify');

const replaceTemplate = require('./modules/replaceTemplate');

///////////////////////////////////
//FILES

// fs.readFile('./txt/start.txt', 'utf-8', (err,data1) => {
    
//     if(err) return console.log('Error!');

//     fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err,data2) => {
//         console.log(data2);
//         fs.readFile(`./txt/append.txt`, 'utf-8', (err,data3) => {
//             console.log(data3);

//             fs.writeFile('./txt/final.txt', `${data2}\n ${data3}`,'utf-8', (err) =>{
//                 console.log('Your file has been written :)');
//             });
//         });
//     });
// });

// console.log('Will read file!');
//////////////////////////////////////////////
//SERVER

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');

const dataObj = JSON.parse(data);

const slugs = dataObj.map(element =>slugify(element.productName,{lower: true}));


const server = http.createServer((req, res) =>{
    
    const {query, pathname} = url.parse(req.url, true); //this javascript es6 standard parses the url and extracts the query and pathname objects

    //Overview page
    if(Object.is(pathname,'/') || Object.is(pathname,'overview')){
        res.writeHead(200, {'Content-type': 'text/html'});

        const cardsHtml = dataObj.map((val, i) => replaceTemplate(tempCard, val, slugs[i])).join(''); 
        //use regex function defined to replace the placeholders in Cardshtml template.

        const output = tempOverview.replace(/{%PRODUCTS_CARDS%}/g, cardsHtml); //insert the cardshtml string into the placeholder in the overview template.
        
        res.end(output);

    //Product page
    } else if(pathname === '/product'){
        res.writeHead(200, {'Content-type': 'text/html'});
        
        const slug = query.id; //access the id property of the query object and retrieve the json object at the position.
        
        const id = slugs.findIndex(currSlug => currSlug === slug); //retrieve the id of the slug by comparing query with the slug object
        
        const output = replaceTemplate(tempProduct,dataObj[id]);
        res.end(output);

    //API
    }else if (pathname === '/api'){
        res.writeHead(200, {'Content-type': 'application/json'});
        res.end(data);
    }
    

    //NON-CATCHED PATHS
    else {
        res.writeHead(404, {
            'Content-type': 'text/html',
            'my-own-header': 'hello-world',
        });
        res.end('<h1>Page not found!</h1>');
    }
});


//start the server and begin to listen for connections
server.listen(8000,'127.0.0.1', () => {
    console.log('Listening to requests on port 8000');
});



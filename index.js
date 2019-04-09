const express = require('express');
const lowerCase = require('lower-case');
const app = express();
const path = require('path');
const ejs = require('ejs');

const port = 3007;

const bodyParser = require('body-parser');
const vsm = require('./VectorSpaceModel');
const queryProcessor = require('./queryProcessor');
const rankDocs = require('./rankDocuments');
const mergeSort = require('./sort');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('view engine', 'ejs');

let server = async () => {
    let data = await vsm.vectorSpaceModel();
    let norm = await vsm.calculateNorms(data.lexemes,data.tfDocuments,data.idf);
    return({data:data,norm:norm})
}
server().then((vsm) => {
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '/home.html'));
    })
    app.get('/getDocument/:docId',  (req, res) => {
        res.sendFile(path.join(__dirname, '/stories/'+req.params.docId+'.txt'));
    });
    app.post('/vsm', async (req, res) => {
        let startTime = Date.now();
        let query = lowerCase(req.body.query);
        let queryData = queryProcessor.getQueryTermsAndTf(query);
        let rank = await rankDocs.rankDocuments(vsm.data.lexemes,vsm.data.tfDocuments,vsm.data.idf,queryData.tfQuery,queryData.termsQuery,vsm.norm);
        rank = mergeSort.mergeSort(rank);
        res.locals.query =req.body.query;
        res.locals.time = Date.now()-startTime;
        res.locals.rank = rank;
        res.render(path.join(__dirname, '/search.ejs'));
    });
    app.listen(port, () => console.log(`Example app listening on port ${port}!`))
});

const natural = require('natural');
const fs = require('fs');
//function to extract stopwords from given stopwords file..
function extractStopWord() {
    let stopWordsFile = './stopWords.txt';
    return fs.readFileSync(stopWordsFile);
}
module.exports = {
    getQueryTermsAndTf: function(query){
        //->these linebreakers will be prohibited from being mapped into dictionary..
        let breakers = ["\n", "", ".", ",", "'", "\"", ":", ";", "?", "\r\n", "!", "--", "-", "(", ")", "\r\n\r\n", "\r\n\r\n\r\n", "]", "["];
        //will extract stopwords and store it in an array..
        let stopWords = extractStopWord();
        // will convert binary  file buffer to utf8 string format..
        stopWords = Array.from(stopWords.toString('utf8'));
        let termsQuery = [];
        let tfQuery = [];
        let tokenizer = new natural.WordPunctTokenizer();
        query = tokenizer.tokenize(query);
        //for each term in querry calculates in term frequency..
        query.forEach(term=>{
            if(!stopWords.includes(term) && !breakers.includes(term)){
                if(!termsQuery.includes(term)){
                    termsQuery.push(term);
                    tfQuery.push(1);
                }
                else{
                    tfQuery[termsQuery.findIndex(token=>token==term)]++;
                }
            }
        })
        return({tfQuery:tfQuery,termsQuery:termsQuery});

    }

}
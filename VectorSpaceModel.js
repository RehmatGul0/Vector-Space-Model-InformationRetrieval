const fs = require('fs');
const lowerCase = require('lower-case')
const natural = require('natural');
const HashMap = require('hashmap');
//function to extract stopwords from given stopwords file..
function extractStopWord() {
    let stopWordsFile = './stopWords.txt';
    return fs.readFileSync(stopWordsFile);
}
module.exports = {
    vectorSpaceModel: async function () {
        //index of every lexeme..
        let wordIndex=0;
        //->these linebreakers will be prohibited from being mapped into dictionary..
        let breakers = ["\n", "", ".", ",", "'", "\"", ":", ";", "?", "\r\n", "!", "--", "-", "(", ")", "\r\n\r\n", "\r\n\r\n\r\n", "]", "["];
        //->this will contain all the lexemes extracted form corpus..
        var lexemes = new HashMap();
        /*
            ->array of arrays.
            ->each block of array will contain another array of length 50 containing term frequency
            for each document in each index
            ->e.g: '0' index will contain term frequency for document 1 and so on..
        */
        let tfDocuments = [];
        //this will contain document frequency of each lexeme..
        let df = [];
        function getData(file, id) {
            //will extract stopwords and store it in an array..
            let stopWords = extractStopWord();
            // will convert binary  file buffer to utf8 string format..
            stopWords = Array.from(stopWords.toString('utf8'));
            //when the work will be done it will resolve the promise. due to asynchronous javascript.
            return new Promise(resolve => {
                //reading file in utf8 format chunk by chunk and sending chunks for processing will save time..
                fs.readFile(file, 'utf8', function read(err, data) {
                    //initializing tokenizer..
                    let tokenizer = new natural.WordPunctTokenizer();
                    //will tokenize the stream data from file buffer..
                    words = tokenizer.tokenize(data);
                    //iterating each term form words array..
                    words.forEach(word => {
                        //converting each word to lowercase format
                        word = lowerCase(word);
                        //removing , from end of word if any..
                        let regex = /[.,\s]/g;
                        word = word.replace(regex, '');

                        //if a word is a breaker or stopword ignore the word and continue..
                        if (!stopWords.includes(word) && !breakers.includes(word)) {
                            /*
                                IF BLOCK:
                                ->if a term is not present in the dictionary hash the term in to the map with index..
                                ->create an array of term frequencies having lenght 50 in which term 
                                frequency of each document will be stored corresponding to a lexeme..
                                ->and document frequncy of that term will be increased to one as the term is
                                newly occured in a document..
                                ->increase wordIndex count..

                                ELSE BLOCK:
                                ->if a term is already present in the dictionary find its index..
                                ->increase the term frequency by one for the document..
                                ->if term is new for this document i-e: tf==0 then increase the document frequency by one..
                            */
                            if (lexemes.get(word)== undefined) {
                                lexemes.set(word,wordIndex);
                                let temptf = new Array(50).fill(0);
                                temptf[id - 1] = 1;
                                tfDocuments.push(temptf);
                                df.push(1);
                                wordIndex++;
                            }
                            else {
                                let wordIndex = lexemes.get(word);
                                if (tfDocuments[wordIndex][id - 1] == 0) {
                                    df[wordIndex]++;
                                }
                                tfDocuments[wordIndex][id - 1]++;
                            }
                        }
                    })
                    //resolving the promise as work is done..
                    resolve();
                });
            })

        }
        //starting from document 1..
        let i = 1;
        //reading all the 50 files from the corpus..
        while (i <= 50) {
            let file = './stories/' + i + '.txt';
            //get data will read a file and will build a dictionary with term frequency and document frequency..
            await getData(file, i);
            i++;
        }
        //converting all document frequencies to inverse document frequencies..
        let idf = [];
        for (let i in df) {
            idf[i] = Math.log10(50.0 / df[i]);
        }
        //now idf contains inverse document frequency values for all terms..

        //returning dictionary, term frequency and document frequency..
        return ({ lexemes: lexemes, tfDocuments: tfDocuments, idf: idf })
    },
    //functions to pre-calculate norms of all documents..
    calculateNorms: async function(lexemes,tfDocuments,idf){
        let documentNorms = [];
        let norm=0;
        let i=0;
        //iterate all documents form 1 to 50...
        while(i<50){
            //for each word in dictionary, square and sum all the term frequencies..
            lexemes.forEach((index)=>{
                norm+=Math.pow(tfDocuments[Number(index)][i]*idf[index],2);
            })
            documentNorms.push(norm);
            i++;
            norm=0;
        }
        return documentNorms;
    }
}
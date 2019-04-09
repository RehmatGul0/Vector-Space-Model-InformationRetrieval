module.exports = {
    rankDocuments: async function(lexemes,tfDocuments,idf,tfQuery,termsQuery,normDocuments){
        let i=0;
        //contains multiplication sum of <tf*idf> of query an documents..
        let  sum=0 ;
        //contains norm of <tf*idf> scores of query..
        let norm=0;
        //contain rank of documents with respect to provided query..
        let ranks=[];
        //calculating rank for each document via cosie formula
        while(i<50){
            for(let j in termsQuery){
                let index = lexemes.get(termsQuery[j]);
                sum+=((tfDocuments[Number(index)][i]*idf[index])*(tfQuery[j]*idf[index]));
                norm+=Math.pow((tfQuery[j]*idf[index]),2);
            }
                ranks.push({documentID:i+1,rank:(sum/(Math.sqrt(norm)*normDocuments[i]))});
            sum=0;
            norm=0;
            i++;
        }
        return ranks;
    }
}
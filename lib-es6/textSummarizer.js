/**
 * 
 * textSummarizer.js
 * 
 * This module uses term frequency-inverse document frequency (tf-idf) 
 * weighting as a statistical means on comparing the similarity of 
 * individual sentences of a body of text to the body of text itself. 
 * A threshold value can be passed to the `summarize` function, which 
 * adjusts the similarity required to filter out sentences. This is done 
 * by a purely extractive means only, for the goal of reasonably good but 
 * fast text summarization.
 * 
 * Author: Eric Liu (https://github.com/eliucs)
 * 
 */

const fs = require('fs');
const natural = require('natural');
const Tokenizer = require('sentence-tokenizer');
const { stemmer } = require('porter-stemmer');

class TextSummarizer {

    static _isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    static _convertToVector(slist) {
        let vector = {};
        slist.forEach((s) => {
            if (!vector[s]) {
                vector[s] = {
                    count: 1
                };
            } else {
                vector[s].count++;
            }
        });
        return vector;
    }

    static summarize(document, threshold) {
        let wordTokenizer = new natural.WordTokenizer();
        let documentTokenizer = new Tokenizer();
        documentTokenizer.setEntry(document);

        // Convert document into vector, normalize document tokens:
        let docWords = wordTokenizer.tokenize(document);
        docWords = docWords
        .filter((w) => {
            return w.match(/[a-z]/i) && !TextSummarizer._isNumber(w);
        })
        .map((w) => {
            return stemmer(w.toLowerCase());
        });
    
        let docVector = TextSummarizer._convertToVector(docWords);

        // Tokenize document by sentence, convert each sentence into a vector,
        // normalize sentence tokens:
        let sentVectors = documentTokenizer.getSentences()
        .map((s, i) => {
            return {
                original: s,
                vector: TextSummarizer._convertToVector(
                    wordTokenizer
                    .tokenize(s)
                    .filter((w) => {
                        return w.match(/[a-z]/i) && !TextSummarizer._isNumber(w);
                    })
                    .map((w) => {
                        return stemmer(w.toLowerCase());
                    })),
                index: i
            };
        });

        // For each term of each vector of each sentence, add the log 
        // frequency weighting of the term frequency (tf):
        sentVectors.forEach((sv) => {
            const keys = Object.keys(sv.vector);
            sv.keys = keys;
            keys.forEach((k) => {
                sv.vector[k].weight = 1 + Math.log10(sv.vector[k].count)
            });
        });

        // Build the inverse document frequency (idf) weighting, and add 
        // tf-idf score to each term in the document:
        const docVectorKeys = Object.keys(docVector);
        const N = docVectorKeys.length;

        let idf = {};
        docVectorKeys.forEach((k) => {
            idf[k] = 0;
            sentVectors.forEach((sv) => {
                if (sv.vector[k]) {
                    idf[k]++;
                }
            });
            idf[k] = Math.log10(N/idf[k]);
            docVector[k].tfIdf =  (1 + Math.log10(docVector[k].count)) * 
                idf[k];
        });

        // Add tf-idf score of each term in each sentence, and the cosine 
        // similarity between the tf-idf scores of each term of each sentence 
        // vector and that of the document vector:
        let docNorm = Math.sqrt(docVectorKeys
        .map((k) => {
            return docVector[k].tfIdf;
        })
        .reduce((acc, x) => {
            return acc + Math.pow(x, 2);
        }, 0));

        sentVectors.forEach((sv) => {
            let svNorm = 0;
            let dotProd = 0;
            sv.keys.forEach((k) => {
                sv.vector[k].tfIdf = sv.vector[k].weight * idf[k];
                if (sv.vector[k].tfIdf && docVector[k].tfIdf) {
                    dotProd += sv.vector[k].tfIdf * docVector[k].tfIdf;
                }
                svNorm += Math.pow(sv.vector[k].tfIdf, 2);
            });
            svNorm = Math.sqrt(svNorm);
            
            if (svNorm) {
                sv.theta = Math.acos(dotProd / (svNorm * docNorm));
                sv.score = (Math.acos(0) - sv.theta) / Math.acos(0);
            } else {
                sv.theta = 0;
                sv.score = 0;
            }
        });

        // Build summarized version of text by filtering all sentence vectors 
        // with scores that are greater or equal to the threshold
        // (between 0 - 1):
        let summary = sentVectors
        .filter((sv, i) => {
            if (i == 0) {
                return true; // Always include first sentence
            }
            return sv.score >= threshold;
        })
        .map((sv) => {
            return sv.original;
        })
        .join('\n');

        // Return summarized version of the text:
        return summary;
    }

    static summarizeAsync(document, threshold, callback) {
        try {
            let summary = TextSummarizer.summarize(document);
            return callback(summary, undefined);
        } catch (e) {
            return callback(undefined, e);
        }
    }

    static summarizeAsyncPromise(document, threshold) {
        return new Promise((resolve, reject) => {
            try {
                let summary = TextSummarizer.summarize(document);
                return resolve(summary);
            } catch (e) {
                return reject(e);
            }
        });
    }

}

module.exports = {
    TextSummarizer
};

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

var fs = require('fs');
var natural = require('natural');
var Tokenizer = require('sentence-tokenizer');

var _require = require('./porterStemmer'),
    PorterStemmer = _require.PorterStemmer;

var TextSummarizer = function () {
    function TextSummarizer() {
        _classCallCheck(this, TextSummarizer);
    }

    _createClass(TextSummarizer, null, [{
        key: '_isNumber',
        value: function _isNumber(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }
    }, {
        key: '_convertToVector',
        value: function _convertToVector(slist) {
            var vector = {};
            slist.forEach(function (s) {
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
    }, {
        key: 'summarize',
        value: function summarize(document, threshold) {
            var wordTokenizer = new natural.WordTokenizer();
            var documentTokenizer = new Tokenizer();
            documentTokenizer.setEntry(document);

            // Convert document into vector, normalize document tokens:
            var docWords = wordTokenizer.tokenize(document);
            docWords = docWords.filter(function (w) {
                return w.match(/[a-z]/i) && !TextSummarizer._isNumber(w);
            }).map(function (w) {
                return PorterStemmer.stem(w.toLowerCase());
            });

            var docVector = TextSummarizer._convertToVector(docWords);

            // Tokenize document by sentence, convert each sentence into a vector,
            // normalize sentence tokens:
            var sentVectors = documentTokenizer.getSentences().map(function (s, i) {
                return {
                    original: s,
                    vector: TextSummarizer._convertToVector(wordTokenizer.tokenize(s).filter(function (w) {
                        return w.match(/[a-z]/i) && !TextSummarizer._isNumber(w);
                    }).map(function (w) {
                        return PorterStemmer.stem(w.toLowerCase());
                    })),
                    index: i
                };
            });

            // For each term of each vector of each sentence, add the log 
            // frequency weighting of the term frequency (tf):
            sentVectors.forEach(function (sv) {
                var keys = Object.keys(sv.vector);
                sv.keys = keys;
                keys.forEach(function (k) {
                    sv.vector[k].weight = 1 + Math.log10(sv.vector[k].count);
                });
            });

            // Build the inverse document frequency (idf) weighting, and add 
            // tf-idf score to each term in the document:
            var docVectorKeys = Object.keys(docVector);
            var N = docVectorKeys.length;

            var idf = {};
            docVectorKeys.forEach(function (k) {
                idf[k] = 0;
                sentVectors.forEach(function (sv) {
                    if (sv.vector[k]) {
                        idf[k]++;
                    }
                });
                idf[k] = Math.log10(N / idf[k]);
                docVector[k].tfIdf = (1 + Math.log10(docVector[k].count)) * idf[k];
            });

            // Add tf-idf score of each term in each sentence, and the cosine 
            // similarity between the tf-idf scores of each term of each sentence 
            // vector and that of the document vector:
            var docNorm = Math.sqrt(docVectorKeys.map(function (k) {
                return docVector[k].tfIdf;
            }).reduce(function (acc, x) {
                return acc + Math.pow(x, 2);
            }, 0));

            sentVectors.forEach(function (sv) {
                var svNorm = 0;
                var dotProd = 0;
                sv.keys.forEach(function (k) {
                    sv.vector[k].tfIdf = sv.vector[k].weight * idf[k];
                    dotProd += sv.vector[k].tfIdf * docVector[k].tfIdf;
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
            var summary = sentVectors.filter(function (sv) {
                return sv.score >= threshold;
            }).map(function (sv) {
                return sv.original;
            }).join('\n');

            return summary;
        }
    }]);

    return TextSummarizer;
}();

module.exports = {
    TextSummarizer: TextSummarizer
};
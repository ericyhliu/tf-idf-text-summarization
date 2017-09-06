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

class TextSummarizer {

    constructor() {}

    summarize() {

    }
}

module.exports = {
    TextSummarizer
};

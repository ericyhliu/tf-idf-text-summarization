/**
 * 
 * textSummarizer.test.js
 * 
 * This module tests by running through the text in the sampleText.txt file 
 * through the text summarizer, provides a default threshold value of 0.1
 * and checks that the length of the summarized version is less than the 
 * original.
 * 
 */

const fs = require('fs');
const { TextSummarizer } = require('./../lib-es6/textSummarizer');

fs.readFile('tests/sampleText.txt', 'utf8', (err, data) => {
    if (err) {
        return console.log(err);
    }

    const summary = TextSummarizer.summarize(data, 0.1);
    console.log(`Original Length: ${data.length}`);
    console.log(` Summary Length: ${summary.length}`);
});


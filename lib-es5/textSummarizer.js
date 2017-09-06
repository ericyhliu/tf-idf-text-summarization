"use strict";

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

var TextSummarizer = function () {
    function TextSummarizer() {
        _classCallCheck(this, TextSummarizer);
    }

    _createClass(TextSummarizer, [{
        key: "summarize",
        value: function summarize() {}
    }]);

    return TextSummarizer;
}();

module.exports = {
    TextSummarizer: TextSummarizer
};
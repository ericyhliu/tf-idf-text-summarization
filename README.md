# tf-idf Text Summarization

In natural language processing and information retrieval systems, [text 
summarization](https://en.wikipedia.org/wiki/Automatic_summarization), 
which is the process of creating a shortened or abridged version of a text, 
becomes an important goal because it allows for unnecessary or extraneous 
aspects of the text to be removed, only leaving the key points of the 
original text.

## Usage

`summarize(document, threshold [, callback])`: Provide the `document` text,
a similarity `threshold` value (between 0 and 1, inclusive) and for the 
asynchronous callback version, the `callback` function.

Minimal usage:

```
TextSummarizer.summarize('This is a sample text');
```

Asynchronous (callback) version:

```
TextSummarizer.summarizeAsync('This is a sample text', (result, error) => {
    if (error) {
        // Handle error...
    } 
    // Do something...
});
```

Asynchronous (Promise) version:

```
TextSummarizer.summarizeAsyncPromise('This is a sample text')
.then((result) => {
    // Do something...
})
.catch((error) => {
    // Handle error...
});
```

## Testing

In the `tests/sampleText.txt` file, replace the text with the text of your
choosing. This uses `babel` to transpile ES6 code to ES5 code, `gulp` to minify 
the ES5 code, and runs the text in the sample text file through the text 
summarizer with a default threshold value of 0.1, and prints out the character
length of the original text with that of the summarized text:

```
npm test
```

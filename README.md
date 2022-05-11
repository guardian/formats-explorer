# formats-explorer

This is a project made for Hackday May 2022 by @ollyscoding, @rtyley and @bryophyta.

## Aim

The aim was to prototype a system which would enable us to explore the 770 possible designs 
generated by the current Guardian formatting spec.

## Implementation

The project consists of three parts:
1. [miner](https://github.com/guardian/formats-explorer/tree/main/miner) a Scala script 
which collects and processes data from the Content API.
3. A [screenshot script](https://github.com/guardian/formats-explorer/tree/main/screenshot-script) 
which takes screenshots of the range of page formats and generates thumbnails from them.
3. [explorer](https://github.com/guardian/formats-explorer/tree/main/explorer), a React app
that allows users to:
    - Preview examples of articles which use a given format.
    - Find URLs for all saved articles of that format.
    - Explore usage figures for each format -- which is used most often? Which aren't used at all?

For the Hackday demo, we have populated the app with data from all of the articles available
on CAPI from the last two weeks. Screenshots are available for up to 10 articles per format,
and links are available for all of the saved articles.
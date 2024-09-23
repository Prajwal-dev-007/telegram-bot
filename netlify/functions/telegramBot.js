/*
const TelegramBot = require('node-telegram-bot-api'); // Changed to use default export
const FeedParser = require('feedparser'); // Correctly import FeedParser
const axios = require('axios');

const TOKEN = process.env.TOKEN; // Ensure TOKEN is set in your environment
const CHANNEL_ID = process.env.CHANNEL_ID; // Ensure CHANNEL_ID is set in your environment
const bot = new TelegramBot(TOKEN, { polling: true }); // Enable polling if necessary

exports.handler = async (event, context) => {
    const rssUrls = [
        'http://corcodilos.com/blog/feed',
        'http://feedity.com/social-hire-com/VlpRUVJU.rss',
        'http://feeds.feedblitz.com/TalentBlog',
        'http://theundercoverrecruiter.com/feed/',
        'http://feeds.feedburner.com/TheStaffingStream',
        'http://booleanstrings.com/feed/',
        'http://www.talentculture.com/feed/',
        'https://resources.workable.com/feed/'
    ];

    for (const rssUrl of rssUrls) {
        try {
            const response = await axios.get(rssUrl, { responseType: 'stream' }); // Use stream for feedparser
            const feedparser = new FeedParser();

            response.data.pipe(feedparser); // Pipe the response data to the FeedParser

            feedparser.on('error', (error) => {
                console.error(`FeedParser error: ${error}`);
            });

            feedparser.on('readable', async () => {
                let entry;
                while (entry = feedparser.read()) {
                    const message = `${entry.title}\n${entry.link}`;
                    try {
                        await bot.sendMessage(CHANNEL_ID, message);
                    } catch (sendError) {
                        console.error(`Error sending message: ${sendError}`);
                    }
                }
            });

            await new Promise((resolve) => {
                feedparser.on('end', resolve); // Wait for the feed to be fully processed
            });

        } catch (error) {
            console.error(`Error fetching or sending feed: ${error}`);
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Feeds sent successfully!' }),
    };
};
*/
const TelegramBot = require('node-telegram-bot-api');
const FeedParser = require('feedparser');
const axios = require('axios');

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const bot = new TelegramBot(TOKEN, { polling: true });

let rssUrls = [
    'http://corcodilos.com/blog/feed',
    'http://feedity.com/social-hire-com/VlpRUVJU.rss',
    'http://feeds.feedblitz.com/TalentBlog',
    'http://theundercoverrecruiter.com/feed/',
    'http://feeds.feedburner.com/TheStaffingStream',
    'http://booleanstrings.com/feed/',
    'http://www.talentculture.com/feed/',
    'https://resources.workable.com/feed/'
];

// To track chat states (user who sent /addrss command)
let awaitingRssUrl = {};

// Command to add a new RSS URL
bot.onText(/\/addrss/, (msg) => {
    const chatId = msg.chat.id;
    
    // Set chat state to waiting for an RSS URL
    awaitingRssUrl[chatId] = true;
    bot.sendMessage(chatId, 'Please send me the RSS feed URL you want to add.');
});


// this is for logging
bot.onText(/\/addrss/, (msg) => {
    const chatId = msg.chat.id;
    console.log(`Received /addrss command from ${chatId}`); // Log the chat ID

    awaitingRssUrl[chatId] = true;
    bot.sendMessage(chatId, 'Please send me the RSS feed URL you want to add.');
});

// Listen for messages to get the RSS link
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // If the bot is waiting for an RSS URL and the message isn't a command
    if (awaitingRssUrl[chatId]) {
        if (text.startsWith('http') && (text.includes('rss') || text.includes('feed'))) {
            if (!rssUrls.includes(text)) {
                rssUrls.push(text); // Add new RSS URL to the list
                bot.sendMessage(chatId, `RSS feed added: ${text}`);
            } else {
                bot.sendMessage(chatId, 'This RSS feed is already in the list.');
            }
        } else {
            bot.sendMessage(chatId, 'That doesn’t look like a valid RSS URL. Please try again.');
        }
        // After processing, remove the chat state
        delete awaitingRssUrl[chatId];
    }
});

// Handler for Netlify function to send feeds
exports.handler = async (event, context) => {
    for (const rssUrl of rssUrls) {
        try {
            const response = await axios.get(rssUrl, { responseType: 'stream' });
            const feedparser = new FeedParser();

            response.data.pipe(feedparser);

            feedparser.on('error', (error) => {
                console.error(`FeedParser error: ${error}`);
            });

            feedparser.on('readable', async () => {
                let entry;
                while ((entry = feedparser.read())) {
                    const message = `${entry.title}\n${entry.link}`;
                    try {
                        await bot.sendMessage(CHANNEL_ID, message);
                    } catch (sendError) {
                        console.error(`Error sending message: ${sendError}`);
                    }
                }
            });

            await new Promise((resolve) => {
                feedparser.on('end', resolve);
            });

        } catch (error) {
            console.error(`Error fetching or sending feed: ${error}`);
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Feeds sent successfully!' }),
    };
};

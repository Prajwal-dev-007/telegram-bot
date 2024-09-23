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

// Log startup message
console.log('Bot is starting...');

// Command to add a new RSS URL
bot.onText(/\/addrss/, (msg) => {
    const chatId = msg.chat.id;
    console.log(`Received /addrss command from chat ${chatId}`);

    // Set chat state to waiting for an RSS URL
    awaitingRssUrl[chatId] = true;
    bot.sendMessage(chatId, 'Please send me the RSS feed URL you want to add.')
        .then(() => console.log('Prompted user for RSS feed URL.'))
        .catch(err => console.error(`Error sending message: ${err.message}`));
});

// Listen for messages to get the RSS link
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    console.log(`Received message from chat ${chatId}: ${text}`);

    // If the bot is waiting for an RSS URL and the message isn't a command
    if (awaitingRssUrl[chatId]) {
        console.log(`Bot is awaiting an RSS URL from chat ${chatId}`);

        if (text.startsWith('http') && (text.includes('rss') || text.includes('feed'))) {
            console.log(`Valid RSS feed URL received: ${text}`);

            if (!rssUrls.includes(text)) {
                rssUrls.push(text); // Add new RSS URL to the list
                console.log(`RSS feed added to list: ${text}`);

                bot.sendMessage(chatId, `RSS feed added: ${text}`)
                    .then(() => console.log(`Confirmation sent to chat ${chatId}`))
                    .catch(err => console.error(`Error sending message: ${err.message}`));
            } else {
                console.log('RSS feed already in the list.');
                bot.sendMessage(chatId, 'This RSS feed is already in the list.')
                    .catch(err => console.error(`Error sending message: ${err.message}`));
            }
        } else {
            console.log('Invalid RSS feed URL provided.');
            bot.sendMessage(chatId, 'That doesn’t look like a valid RSS URL. Please try again.')
                .catch(err => console.error(`Error sending message: ${err.message}`));
        }

        // After processing, remove the chat state
        delete awaitingRssUrl[chatId];
        console.log(`Chat ${chatId} no longer awaiting RSS URL.`);
    }
});

// Handler for Netlify function to send feeds
exports.handler = async (event, context) => {
    console.log('Triggered Netlify function to send feeds.');

    for (const rssUrl of rssUrls) {
        console.log(`Fetching feed: ${rssUrl}`);

        try {
            const response = await axios.get(rssUrl, { responseType: 'stream' });
            const feedparser = new FeedParser();

            response.data.pipe(feedparser);

            feedparser.on('error', (error) => {
                console.error(`FeedParser error for ${rssUrl}: ${error.message}`);
            });

            feedparser.on('readable', async () => {
                let entry;
                while ((entry = feedparser.read())) {
                    const message = `${entry.title}\n${entry.link}`;
                    console.log(`Parsed feed entry: ${message}`);

                    try {
                        await bot.sendMessage(CHANNEL_ID, message);
                        console.log(`Message sent to channel ${CHANNEL_ID}: ${message}`);
                    } catch (sendError) {
                        console.error(`Error sending message to channel ${CHANNEL_ID}: ${sendError.message}`);
                    }
                }
            });

            await new Promise((resolve) => {
                feedparser.on('end', resolve);
            });
            console.log(`Finished processing feed: ${rssUrl}`);

        } catch (error) {
            console.error(`Error fetching or processing feed ${rssUrl}: ${error.message}`);
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Feeds sent successfully!' }),
    };
};

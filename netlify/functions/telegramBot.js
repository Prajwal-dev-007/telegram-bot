/*
const TelegramBot = require('node-telegram-bot-api'); // Changed to use default export
const FeedParser = require('feedparser'); // Correctly import FeedParser
const axios = require('axios');

const TOKEN = process.env.TOKEN; 
const CHANNEL_ID = process.env.CHANNEL_ID; 
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
const fs = require('fs');

// Token and Channel ID (Make sure these are set in your Netlify environment variables)
const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const bot = new TelegramBot(TOKEN, { polling: true });

// Path to store RSS URLs dynamically added via /addrss
const RSS_FILE_PATH = './rss_urls.json';

// Load RSS URLs from the JSON file
function loadRssUrls() {
    try {
        const data = fs.readFileSync(RSS_FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading RSS file:', err);
        return [];
    }
}

// Save RSS URLs to the JSON file
function saveRssUrls(urls) {
    try {
        fs.writeFileSync(RSS_FILE_PATH, JSON.stringify(urls, null, 2));
        console.log('RSS URLs saved successfully.');
    } catch (err) {
        console.error('Error writing to RSS file:', err);
    }
}

// Validate RSS link
async function validateRssLink(rssLink) {
    try {
        const response = await axios.get(rssLink);
        return response.status === 200;
    } catch (error) {
        console.error('Invalid RSS link:', error);
        return false;
    }
}

// Function to handle /addrss command
bot.onText(/\/addrss (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const rssLink = match[1].trim(); // Extract the RSS URL from the command
    let rssUrls = loadRssUrls(); // Load the existing URLs

    if (await validateRssLink(rssLink)) {
        if (!rssUrls.includes(rssLink)) {
            rssUrls.push(rssLink); // Add the new RSS link
            saveRssUrls(rssUrls); // Save updated list to the JSON file
            bot.sendMessage(chatId, `New RSS link added: ${rssLink}`);
        } else {
            bot.sendMessage(chatId, `This RSS link is already in the list.`);
        }
    } else {
        bot.sendMessage(chatId, `Invalid RSS link: ${rssLink}`);
    }
});

// Function to fetch and send RSS feeds
async function fetchAndSendFeeds() {
    const rssUrls = loadRssUrls(); // Load only dynamic URLs from the JSON file

    // Check if there are any URLs to process
    if (rssUrls.length === 0) {
        console.log('No RSS URLs found.');
        return;
    }

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
}

// Export the handler for Netlify
exports.handler = async (event, context) => {
    // Ensure RSS feed fetching is handled when invoked
    await fetchAndSendFeeds();

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Feeds sent successfully!' }),
    };
};

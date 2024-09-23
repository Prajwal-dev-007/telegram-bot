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
/*
const TelegramBot = require('node-telegram-bot-api');
const FeedParser = require('feedparser');
const axios = require('axios');
const fs = require('fs');

const TOKEN = process.env.TOKEN; // Ensure TOKEN is set in your environment
const CHANNEL_ID = process.env.CHANNEL_ID; // Ensure CHANNEL_ID is set in your environment
const bot = new TelegramBot(TOKEN, { polling: true });

const RSS_FILE_PATH = './rss_urls.json'; // File to store the RSS URLs

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

// Initialize RSS URLs from the file
let rssUrls = loadRssUrls();

// Function to validate the RSS URL
async function validateRssUrl(rssUrl) {
    try {
        const response = await axios.get(rssUrl);
        return response.status === 200;
    } catch (error) {
        return false;
    }
}

// Command to add an RSS link
bot.onText(/\/addrss (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const rssUrl = match[1];

    const isValid = await validateRssUrl(rssUrl);
    if (isValid) {
        rssUrls.push(rssUrl);
        saveRssUrls(rssUrls);  // Save the updated URLs to the JSON file
        bot.sendMessage(chatId, `RSS link ${rssUrl} added successfully!`);
    } else {
        bot.sendMessage(chatId, `Invalid RSS link: ${rssUrl}`);
    }
});

// Function to send RSS entries to the channel
async function sendRssFeeds() {
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
                feedparser.on('end', resolve);
            });
        } catch (error) {
            console.error(`Error fetching or sending feed: ${error}`);
        }
    }
}

// Call this function periodically or trigger it from another event
sendRssFeeds();
*/
const TelegramBot = require('node-telegram-bot-api');
const FeedParser = require('feedparser');
const axios = require('axios');
const fs = require('fs');

const TOKEN = '7619941228:AAGHpKq2OaqzDy_fjRkCkhfC6m1e9xt5ffQ';
const CHANNEL_ID = '@datamazesolutions';
//const bot = new TelegramBot(TOKEN, { polling: true });
const bot = new TelegramBot(TOKEN);


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

// Initialize RSS URLs from the file
let rssUrls = loadRssUrls();

// Function to send RSS entries to the channel
async function sendRssFeeds() {
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

// Export the handler function that Netlify will invoke
exports.handler = async function (event, context) {
    try {
        await sendRssFeeds();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'RSS feeds sent successfully' }),
        };
    } catch (error) {
        console.error('Error in handler:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to send RSS feeds' }),
        };
    }
};

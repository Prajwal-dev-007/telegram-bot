const { Bot } = require('node-telegram-bot-api');
const feedparser = require('feedparser');
const axios = require('axios');

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const bot = new Bot(TOKEN);

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
            const response = await axios.get(rssUrl);
            const feed = feedparser.parse(response.data);
            if (feed && feed.entries) {
                for (const entry of feed.entries.slice(0, 3)) {
                    const message = `${entry.title}\n${entry.link}`;
                    await bot.sendMessage(CHANNEL_ID, message);
                }
            }
        } catch (error) {
            console.error(`Error fetching or sending feed: ${error}`);
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Feeds sent successfully!' }),
    };
};

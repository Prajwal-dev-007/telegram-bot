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
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI; // MongoDB connection string stored in Netlify's environment variables

const axios = require('axios');
const FeedParser = require('feedparser');

// Connect to MongoDB
async function connectToDB() {
  const client = new MongoClient(uri);
  await client.connect();
  const database = client.db('rssDB');  // Replace 'rssDB' with your actual database name
  const collection = database.collection('rssLinks');  // Replace 'rssLinks' with your collection name
  return { client, collection };
  

}


// Function to add a new RSS link to MongoDB
async function addRssLink(rssLink) {
  const { client, collection } = await connectToDB();
  const existingLink = await collection.findOne({ link: rssLink });
  
  if (!existingLink) {
    await collection.insertOne({ link: rssLink, addedAt: new Date() });
    console.log(`RSS link added: ${rssLink}`);
  } else {
    console.log(`RSS link already exists: ${rssLink}`);
  }
  
  client.close();
}

// Function to get all RSS links from MongoDB
async function getRssLinks() {
  const { client, collection } = await connectToDB();
  const links = await collection.find({}).toArray();
  client.close();
  return links.map(link => link.link);
}

// Telegram Bot Integration Example
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TOKEN, { polling: true });
const CHANNEL_ID = process.env.CHANNEL_ID;

// Command to add an RSS link via Telegram
bot.onText(/\/addrss (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const rssLink = match[1].trim();

  try {
    await addRssLink(rssLink);
    bot.sendMessage(chatId, `RSS link added: ${rssLink}`);
  } catch (error) {
    bot.sendMessage(chatId, `Error adding RSS link: ${error.message}`);
  }
});

// Function to fetch and send RSS feeds to the Telegram channel


async function fetchAndSendFeeds() {
  const rssLinks = await getRssLinks(); // Fetch RSS links from MongoDB

  if (rssLinks.length === 0) {
    console.log('No RSS links found.');
    return;
  }
  console.log("Starting to fetch RSS feeds...");
  for (const rssUrl of rssLinks) {
    console.log(`Fetching feed: ${rssUrl}`);
    try {
      const response = await axios.get(rssUrl);
      const feedparser = new FeedParser();

      // Create a stream from the response data
      feedparser.end(response.data);

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

      feedparser.on('error', (error) => {
        console.error(`Error parsing feed: ${error}`);
      });
      console.log(`Successfully fetched feed: ${rssUrl}`);
    } catch (error) {
      console.error(`Error fetching RSS feed: ${rssUrl}, Error: ${error.message}`);
    }
  }
}


// Netlify function handler
exports.handler = async (event, context) => {
  await fetchAndSendFeeds(); // Fetch and send the RSS feeds

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Feeds sent successfully!' }),
  };
};

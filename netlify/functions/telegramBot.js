/*
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




async function getRssLinks() {
    const { client, collection } = await connectToDB();
    
    // Fetch all documents in the collection
    const linksDocuments = await collection.find({}).toArray();
    
    client.close();
    
    // Extract the 'link' field from each document and return as an array of links
    return linksDocuments.map(doc => doc.link);
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


async function fetchAndSendFeeds() {
    const rssLinks = await getRssLinks(); // Fetch all RSS links from MongoDB

    if (rssLinks.length === 0) {
        console.log('No RSS links found.');
        return;
    }

   

    // Process all links concurrently
    const fetchPromises = rssLinks.map(async (rssUrl) => {
        console.log(`Fetching feed: ${rssUrl}`);
        try {
            const response = await axios.get(rssUrl, { responseType: 'stream', timeout: 20000 });
            console.log(`Response status: ${response.status}`);

            const feedparser = new FeedParser();
            response.data.pipe(feedparser);

            // Handle 'readable' event: when FeedParser successfully reads data
            feedparser.on('readable', async () => {
                console.log(`Parsing feed from URL: ${rssUrl}`);
                let entry;
                while ((entry = feedparser.read())) {
                    const message = `${entry.title}\n${entry.link}`;
                    console.log(`Parsed entry: ${message}`);
                    try {
                        await bot.sendMessage(CHANNEL_ID, message);
                        console.log(`Message sent successfully: ${entry.title}`);
                    } catch (sendError) {
                        console.error(`Error sending message: ${sendError.message}`);
                    }
                }
            });

            // Handle 'error' event: log errors while parsing feed
            feedparser.on('error', (err) => {
                console.error(`FeedParser error on URL ${rssUrl}: ${err.message}`);
            });

            // Handle 'end' event: log when the feed parsing is completed
            feedparser.on('end', () => {
                console.log(`Finished parsing feed: ${rssUrl}`);
            });

        } catch (error) {
            console.error(`Error fetching RSS feed from ${rssUrl}: ${error.message}`);
        }
    });

    // Await all the fetches
    await Promise.all(fetchPromises);

    console.log("Finished fetching all RSS feeds.");
}


// Netlify function handler
exports.handler = async (event, context) => {
  await fetchAndSendFeeds(); // Fetch and send the RSS feeds

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Feeds sent successfully!' }),
  };
};
*/
const { MongoClient } = require('mongodb');
const axios = require('axios');
const FeedParser = require('feedparser');
const TelegramBot = require('node-telegram-bot-api');

// LinkedIn access token and organization ID from environment variables
const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const LINKEDIN_ORG_ID = process.env.LINKEDIN_ORG_ID;

// MongoDB connection
const uri = process.env.MONGODB_URI; // MongoDB connection string stored in Netlify's environment variables

// Telegram bot setup
const bot = new TelegramBot(process.env.TOKEN, { polling: true });
const CHANNEL_ID = process.env.CHANNEL_ID;

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
  
  // Fetch all documents in the collection
  const linksDocuments = await collection.find({}).toArray();
  
  client.close();
  
  // Extract the 'link' field from each document and return as an array of links
  return linksDocuments.map(doc => doc.link);
}

// Telegram Command to add an RSS link via Telegram
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

// Function to send feed to LinkedIn
async function sendToLinkedIn(feedContent) {
  const url = "https://api.linkedin.com/v2/ugcPosts";
  const headers = {
    "Authorization": `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
    "X-Restli-Protocol-Version": "2.0.0",
    "Content-Type": "application/json"
  };

  const data = {
    "author": `urn:li:organization:${LINKEDIN_ORG_ID}`,
    "lifecycleState": "PUBLISHED",
    "specificContent": {
      "com.linkedin.ugc.ShareContent": {
        "shareCommentary": {
          "text": feedContent
        },
        "shareMediaCategory": "NONE"
      }
    },
    "visibility": {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
    }
  };

  try {
    const response = await axios.post(url, data, { headers });
    if (response.status === 201) {
      console.log("Successfully posted to LinkedIn.");
    } else {
      console.error(`Failed to post to LinkedIn: ${response.status}, ${response.data}`);
    }
  } catch (error) {
    console.error(`Error posting to LinkedIn: ${error.message}`);
  }
}

// Function to fetch and send feeds to Telegram and LinkedIn
async function fetchAndSendFeeds() {
  const rssLinks = await getRssLinks(); // Fetch all RSS links from MongoDB

  if (rssLinks.length === 0) {
    console.log('No RSS links found.');
    return;
  }

  // Process all links concurrently
  const fetchPromises = rssLinks.map(async (rssUrl) => {
    console.log(`Fetching feed: ${rssUrl}`);
    try {
      const response = await axios.get(rssUrl, { responseType: 'stream', timeout: 20000 });
      console.log(`Response status: ${response.status}`);

      const feedparser = new FeedParser();
      response.data.pipe(feedparser);

      // Handle 'readable' event: when FeedParser successfully reads data
      feedparser.on('readable', async () => {
        console.log(`Parsing feed from URL: ${rssUrl}`);
        let entry;
        while ((entry = feedparser.read())) {
          const message = `${entry.title}\n${entry.link}`;
          console.log(`Parsed entry: ${message}`);
          
          // Send to Telegram
          try {
            await bot.sendMessage(CHANNEL_ID, message);
            console.log(`Message sent successfully to Telegram: ${entry.title}`);
          } catch (sendError) {
            console.error(`Error sending message to Telegram: ${sendError.message}`);
          }

          // Send to LinkedIn
          try {
            await sendToLinkedIn(message);
            console.log(`Message sent successfully to LinkedIn: ${entry.title}`);
          } catch (sendError) {
            console.error(`Error sending message to LinkedIn: ${sendError.message}`);
          }
        }
      });

      // Handle 'error' event: log errors while parsing feed
      feedparser.on('error', (err) => {
        console.error(`FeedParser error on URL ${rssUrl}: ${err.message}`);
      });

      // Handle 'end' event: log when the feed parsing is completed
      feedparser.on('end', () => {
        console.log(`Finished parsing feed: ${rssUrl}`);
      });

    } catch (error) {
      console.error(`Error fetching RSS feed from ${rssUrl}: ${error.message}`);
    }
  });

  // Await all the fetches
  await Promise.all(fetchPromises);

  console.log("Finished fetching all RSS feeds.");
}

// Netlify function handler
exports.handler = async (event, context) => {
  await fetchAndSendFeeds(); // Fetch and send the RSS feeds

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Feeds sent successfully!' }),
  };
};

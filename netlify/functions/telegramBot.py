"""
import os
import json
import feedparser
import requests
from telegram import Bot

TOKEN = os.getenv('7619941228:AAGHpKq2OaqzDy_fjRkCkhfC6m1e9xt5ffQ')
CHANNEL_ID = os.getenv('@datamazesolutions')

def handler(event, context):
    bot = Bot(token=TOKEN)
    rss_urls = [
       'http://corcodilos.com/blog/feed',
        'http://feedity.com/social-hire-com/VlpRUVJU.rss',
        'http://feeds.feedblitz.com/TalentBlog',
        'http://theundercoverrecruiter.com/feed/',
        'http://feeds.feedburner.com/TheStaffingStream',
        'http://booleanstrings.com/feed/',
        'http://www.talentculture.com/feed/',
        'https://resources.workable.com/feed/'
    ]

    for rss_url in rss_urls:
        feed = feedparser.parse(rss_url)
        if feed.entries:
            for entry in feed.entries[:3]:  # Fetch only 3 entries per feed
                message = f"{entry.title}\n{entry.link}"
                bot.send_message(chat_id=CHANNEL_ID, text=message)

    return {
        'statusCode': 200,
        'body': json.dumps('Messages sent successfully!')
    }
print("script executed")
"""
"""""
import os
import json
import feedparser
import requests
from telegram import Bot, Update
from telegram.ext import CommandHandler, ApplicationBuilder, ContextTypes
import nest_asyncio


TOKEN =  '7619941228:AAGHpKq2OaqzDy_fjRkCkhfC6m1e9xt5ffQ'# Replace with actual environment variable
CHANNEL_ID =  '@datamazesolutions' # Replace with actual environment variable

# Initialize the list of RSS URLs
rss_urls = [
    'http://corcodilos.com/blog/feed',
    'http://feedity.com/social-hire-com/VlpRUVJU.rss',
    'http://feeds.feedblitz.com/TalentBlog',
    'http://theundercoverrecruiter.com/feed/',
    'http://feeds.feedburner.com/TheStaffingStream',
    'http://booleanstrings.com/feed/',
    'http://www.talentculture.com/feed/',
    'https://resources.workable.com/feed/'
]

def validate_rss_link(rss_link: str) -> bool:
    """"Validate if the provided link is a valid RSS feed.""""
    try:
        response = requests.get(rss_link)
        return response.status_code == 200
    except requests.RequestException:
        return False

async def addrss(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """"Command to add an RSS link.""""
    if context.args:
        rss_link = context.args[0]
        if validate_rss_link(rss_link):
            rss_urls.append(rss_link)
            await update.message.reply_text(f"RSS link {rss_link} added successfully!")
        else:
            await update.message.reply_text(f"Invalid RSS link: {rss_link}")
    else:
        await update.message.reply_text("Please provide a valid RSS link after the command.")

async def send_feeds():
    """"Send messages for the existing RSS feeds.""""
    bot = Bot(token=TOKEN)

    for rss_url in rss_urls:
        feed = feedparser.parse(rss_url)
        if feed.entries:
            for entry in feed.entries[:3]:  # Fetch only 3 entries per feed
                message = f"{entry.title}\n{entry.link}"
                await bot.send_message(chat_id=CHANNEL_ID, text=message)

async def main():
    
    app = ApplicationBuilder().token(TOKEN).build()

    # Command to add RSS
    app.add_handler(CommandHandler('addrss', addrss))

    await send_feeds()

    # Start the bot
    await app.run_polling()

if __name__ == '__main__':
    nest_asyncio.apply()
    import asyncio
    print("Bot is starting...")
    asyncio.run(main())


"""""
import os
import json
import feedparser
import requests
from telegram import Bot, Update
from telegram.ext import CommandHandler, ApplicationBuilder, ContextTypes
import nest_asyncio

TOKEN =  os.getenv('7619941228:AAGHpKq2OaqzDy_fjRkCkhfC6m1e9xt5ffQ') # Replace with your actual bot token
CHANNEL_ID = os.get('@datamazesolutions') # Replace with your actual channel ID
RSS_FILE_PATH = 'rss_urls.json'  # File to store the RSS URLs

# Load RSS URLs from the JSON file
def load_rss_urls() -> list:
    try:
        with open(RSS_FILE_PATH, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

# Save RSS URLs to the JSON file
def save_rss_urls(urls: list):
    with open(RSS_FILE_PATH, 'w') as f:
        json.dump(urls, f, indent=2)

# Initialize RSS URLs from the file
rss_urls = load_rss_urls()

def validate_rss_link(rss_link: str) -> bool:
    """Validate if the provided link is a valid RSS feed."""
    try:
        response = requests.get(rss_link)
        return response.status_code == 200
    except requests.RequestException:
        return False

async def addrss(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Command to add an RSS link."""
    if context.args:
        rss_link = context.args[0]
        if validate_rss_link(rss_link):
            rss_urls.append(rss_link)
            save_rss_urls(rss_urls)  # Save the updated URLs to the JSON file
            await update.message.reply_text(f"RSS link {rss_link} added successfully!")
        else:
            await update.message.reply_text(f"Invalid RSS link: {rss_link}")
    else:
        await update.message.reply_text("Please provide a valid RSS link after the command.")

async def send_feeds():
    """Send messages for the existing RSS feeds."""
    bot = Bot(token=TOKEN)

    for rss_url in rss_urls:
        feed = feedparser.parse(rss_url)
        if feed.entries:
            for entry in feed.entries[:3]:  # Fetch only 3 entries per feed
                message = f"{entry.title}\n{entry.link}"
                await bot.send_message(chat_id=CHANNEL_ID, text=message)

async def main():
    """Start the bot."""
    app = ApplicationBuilder().token(TOKEN).build()

    # Command to add RSS
    app.add_handler(CommandHandler('addrss', addrss))

    #await send_feeds()

    # Start the bot
    await app.run_polling()

if __name__ == '__main__':
    nest_asyncio.apply()
    import asyncio
    print("Bot is starting...")
    asyncio.run(main())

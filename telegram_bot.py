"""
import schedule
import time
import feedparser
import logging
from telegram import Bot
from datetime import datetime
import asyncio

# Your bot token and channel ID
TOKEN = '7619941228:AAGHpKq2OaqzDy_fjRkCkhfC6m1e9xt5ffQ'
CHANNEL_ID = '@datamazesolutions'

bot = Bot(token=TOKEN)
logging.basicConfig(level=logging.INFO)

# Function to send RSS feed to the channel
async def send_feed_to_channel():
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
        try:
            feed = feedparser.parse(rss_url)
            if feed.entries:
                for entry in feed.entries[:3]:  # Fetch only 3 entries per feed
                    message = f"{entry.title}\n{entry.link}"
                    await bot.send_message(chat_id=CHANNEL_ID, text=message)
        except Exception as e:
            logging.error(f"Error fetching or sending feed: {e}")

# Function to schedule the job
def schedule_jobs():
    schedule.every().day.at("08:00").do(lambda: asyncio.run(send_feed_to_channel()))  # Schedule for 8:00 AM
    schedule.every().day.at("17:25").do(lambda: asyncio.run(send_feed_to_channel()))  # Schedule for 6:00 PM

# Main function to run the scheduler
def main():
    logging.info("Starting the bot and scheduling tasks...")

    # Schedule jobs
    schedule_jobs()

    # Continuously run the scheduler
    while True:
        schedule.run_pending()
        time.sleep(60)  # Wait for 1 minute before checking again

if __name__ == '__main__':
    main()
"""

import schedule
import time
import feedparser
import logging
from telegram import Bot
from datetime import datetime
import asyncio

# Your bot token and channel ID
TOKEN = '7619941228:AAGHpKq2OaqzDy_fjRkCkhfC6m1e9xt5ffQ'
CHANNEL_ID = '@datamazesolutions'

# Initialize bot
bot = Bot(token=TOKEN)
logging.basicConfig(level=logging.INFO)

# Function to send RSS feed to the channel
async def send_feed_to_channel():
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
        try:
            feed = feedparser.parse(rss_url)
            if feed.entries:
                for entry in feed.entries[:3]:  # Fetch only 3 entries per feed
                    message = f"{entry.title}\n{entry.link}"
                    await bot.send_message(chat_id=CHANNEL_ID, text=message)
        except Exception as e:
            logging.error(f"Error fetching or sending feed: {e}")

# Function to schedule the job
def schedule_jobs():
    schedule.every().day.at("08:00").do(lambda: asyncio.run(send_feed_to_channel()))  # Schedule for 8:00 AM
    schedule.every().day.at("17:25").do(lambda: asyncio.run(send_feed_to_channel()))  # Schedule for 6:00 PM

# Main function to run the scheduler
def main():
    logging.info("Starting the bot and scheduling tasks...")

    # Schedule jobs
    schedule_jobs()

    # Continuously run the scheduler
    while True:
        schedule.run_pending()
        time.sleep(60)  # Wait for 1 minute before checking again

if __name__ == '__main__':
    # Run the bot continuously with long polling
    main()


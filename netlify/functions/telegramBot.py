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
import os
import json
import feedparser
import requests
from telegram import Bot, Update
from telegram.ext import CommandHandler, MessageHandler, Filters, Updater

TOKEN = os.getenv('7619941228:AAGHpKq2OaqzDy_fjRkCkhfC6m1e9xt5ffQ')
CHANNEL_ID = os.getenv('@datamazesolutions')
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

# Telegram Bot setup
bot = Bot(token=TOKEN)

def send_rss_feeds():
    """Send RSS feeds to the specified channel"""
    for rss_url in rss_urls:
        feed = feedparser.parse(rss_url)
        if feed.entries:
            for entry in feed.entries[:3]:  # Fetch only 3 entries per feed
                message = f"{entry.title}\n{entry.link}"
                bot.send_message(chat_id=CHANNEL_ID, text=message)

# Command to add new RSS feed
def add_rss(update: Update, context):
    update.message.reply_text('Please send me the RSS feed URL you want to add.')

# Message handler to add RSS feed
def handle_message(update: Update, context):
    text = update.message.text
    if text.startswith('http') and ('rss' in text or 'feed' in text):
        if text not in rss_urls:
            rss_urls.append(text)
            update.message.reply_text(f'RSS feed added: {text}')
        else:
            update.message.reply_text('This RSS feed is already in the list.')

# Main function to run the bot
def main():
    updater = Updater(token=TOKEN, use_context=True)
    dp = updater.dispatcher

    # Command handler for adding new RSS feed
    dp.add_handler(CommandHandler('addrss', add_rss))

    # Message handler for receiving RSS URLs
    dp.add_handler(MessageHandler(Filters.text & ~Filters.command, handle_message))

    # Start polling for messages
    updater.start_polling()
    updater.idle()

if __name__ == '__main__':
    main()

# Function that would be called by your serverless platform (AWS Lambda, etc.)
def handler(event, context):
    send_rss_feeds()
    return {
        'statusCode': 200,
        'body': json.dumps('Messages sent successfully!')
    }


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
from telegram.ext import CommandHandler, Updater, CallbackContext

TOKEN = os.getenv('7619941228:AAGHpKq2OaqzDy_fjRkCkhfC6m1e9xt5ffQ')  # Replace with actual environment variable
CHANNEL_ID = os.getenv('@datamazesolutions')  # Replace with actual environment variable

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
    """Validate if the provided link is a valid RSS feed."""
    try:
        response = requests.get(rss_link)
        return response.status_code == 200
    except requests.RequestException:
        return False

def addrss(update: Update, context: CallbackContext) -> None:
    """Command to add an RSS link."""
    if context.args:
        rss_link = context.args[0]
        if validate_rss_link(rss_link):
            rss_urls.append(rss_link)
            update.message.reply_text(f"RSS link {rss_link} added successfully!")
        else:
            update.message.reply_text(f"Invalid RSS link: {rss_link}")
    else:
        update.message.reply_text("Please provide a valid RSS link after the command.")

def handler(event, context):
    bot = Bot(token=TOKEN)

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

def main():
    """Start the bot."""
    updater = Updater(token=TOKEN, use_context=True)
    dispatcher = updater.dispatcher

    # Command to add RSS
    dispatcher.add_handler(CommandHandler('addrss', addrss))

    # Start polling
    updater.start_polling()
    updater.idle()

if __name__ == '__main__':
    print("Bot is starting...")
    main()

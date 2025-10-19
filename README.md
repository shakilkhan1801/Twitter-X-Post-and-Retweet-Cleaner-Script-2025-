# Twitter/X Post and Retweet Cleaner Script (2025)

This JavaScript script cleans your Twitter (X) profile by unretweeting retweets and deleting original posts. It runs in the browser console on your /posts tab, simulating manual actions to avoid detection. **Use at your own risk—automation may lead to account suspension. Test on a small batch first.**

## Features
- **Fast Unretweet**: Direct click on unretweet button (0.5 seconds, no menu).
- **Quick Post Delete**: More button > Delete option > Confirm (1 second, minimal menu flash).
- **Batch Processing**: Handles 150 actions per run; rerun for more.
- **Logging**: Console shows progress (e.g., "Unretweeted #1", "Deleted post #1").
- **Safe Delays**: Respects X rate limits (50 actions/min).

## Requirements
- Twitter/X account logged in.
- Browser: Chrome or Firefox (DevTools enabled).
- Posts tab: https://x.com/yourusername/posts.

## Usage Instructions
1. Log in to Twitter/X and go to your profile's **Posts** tab (https://x.com/yourusername/posts).
2. Scroll down to load 10+ posts (script needs visible items).
3. Open Developer Tools (F12 or Right-click > Inspect).
4. Go to **Console** tab.
5. Clear console (Ctrl+L), paste the script from `script.js`, and press Enter.
6. Watch the console for logs (e.g., "Found 10 posts", "Unretweeted #1").
7. The script runs for 150 attempts (~150 actions). Rerun for more posts.
8. Refresh the page after batch to continue.

### Example Logs
🚀 Starting Post and Retweet Cleaner in /posts tab.
Attempt 1: Found 10 posts
🔄 Unretweeted #1 (direct, fast)
Progress: 5 actions (unretweets + deletes).
🎉 Batch complete! Total actions: 10.

## How It Works
- **Unretweet**: Detects retweet button ([data-testid="unretweet"]), clicks it directly, confirms without menu.
- **Post Delete**: For original posts, clicks More button ([data-testid="caret"]), selects "Delete", confirms.
- **Speed**: Unretweet: 0.5 sec, Post delete: 1 sec. Total for 5k posts: 30-45 minutes (in batches).
- **Safety**: Delays prevent rate limits. Hides processed posts to skip them.

## Warnings
- **Irreversible**: Deleted posts cannot be recovered.
- **Account Risk**: X prohibits automation. Use responsibly; small batches first.
- **Limitations**: Only works on /posts tab. For likes/replies, use separate tools or Python scripts (see below).
- **Legal**: This script is for personal use. Do not use for spam or malicious purposes.
- **Test**: Run on a test account first.

## Troubleshooting
- **No actions**: Scroll to load more posts. Ensure you're in /posts tab.
- **"Found 0 posts"**: Page not loaded; refresh and scroll.
- **Errors**: Check console. If selectors fail (UI change), update the script.
- **Slow**: X rate limit; wait or rerun.

## Alternatives for Likes/Replies
- For unlike likes: Use Python tool like tweetXer (github.com/lucahammer/tweetXer).
- For delete replies: Manual or Python archive-based deletion.

## License
MIT License. Free to use, modify, distribute. Credit if reposted.

## Author
Created for personal use. Inspired by open-source Twitter cleaners.

---

If you have issues, check the console logs or update selectors for X UI changes.

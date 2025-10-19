/*
Fixed Twitter/X Cleaner - 2025 (Unlike Fixed, Fast Post/Unretweet)
Improved heart detection in Likes with hover sim. 1-1.5 sec delay.
Test in /likes tab first.
*/

const waitForElemToExist = async (selector, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      const elem = document.querySelector(selector);
      if (elem) resolve(elem);
      else if (Date.now() - startTime > timeout) reject(new Error(`Timeout: ${selector}`));
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, { subtree: true, childList: true });
    const interval = setInterval(check, 300); // Very fast polling
    setTimeout(() => {
      observer.disconnect();
      clearInterval(interval);
    }, timeout);
  });
};

const detectTab = () => {
  const url = window.location.href.toLowerCase();
  if (url.includes('/likes')) return 'likes';
  if (url.includes('/with_replies') || url.includes('/replies')) return 'replies';
  if (url.includes('/posts')) return 'posts';
  return 'posts';
};

const diagnosticCheck = () => {
  const tab = detectTab();
  let count = 0;
  let buttons = [];
  if (tab === 'likes') {
    // Detailed unlike detection
    buttons = [...document.querySelectorAll('[data-testid="unlike"], [data-testid="like"], svg[aria-label*="Unlike"], button[aria-label*="Unlike"]')];
    count = buttons.filter(btn => btn.offsetParent !== null).length;
    console.log(`❤️ Likes tab: Total heart buttons found: ${buttons.length}, Visible: ${count}`);
    if (count === 0) console.log('No hearts? Scroll or hover over likes to load unlike mode.');
  } else if (tab === 'replies') {
    count = document.querySelectorAll('[data-testid="tweet"]').length;
    console.log(`💬 Replies tab: Visible comments: ${count}`);
  } else {
    count = document.querySelectorAll('[data-testid="tweet"]').length;
    console.log(`🗑️ Posts tab: Visible posts: ${count}`);
  }
  return count > 0;
};

const scrollToLoad = async () => {
  const timeline = document.querySelector('[data-testid="primaryColumn"]');
  if (timeline) timeline.scrollTop = timeline.scrollHeight;
  else window.scrollTo(0, document.body.scrollHeight);
  await new Promise(r => setTimeout(r, 1000)); // Quick
};

const findDeleteOption = (isReply = false) => {
  const menus = document.querySelectorAll('[role="menuitem"]');
  for (let menu of menus) {
    const text = menu.textContent.toLowerCase().trim();
    if (isReply && (text.includes('delete') || text.includes('reply'))) return menu;
    if (text.includes('delete') || text.includes('remove')) return menu;
  }
  return null;
};

const simulateHover = (elem) => {
  if (elem) {
    elem.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    elem.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
  }
};

const deleteTweets = async () => {
  if (!diagnosticCheck()) return;

  const tab = detectTab();
  let action_count = 0;
  let attempts = 0;
  const maxAttempts = 150;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      await scrollToLoad();

      let actionButton = null;
      let targetItem = null;

      if (tab === 'likes') {
        // Fixed Unlike: Multiple selectors + hover
        const possibleButtons = [
          ...document.querySelectorAll('[data-testid="unlike"]'),
          ...document.querySelectorAll('[data-testid="like"]'),
          ...document.querySelectorAll('svg[aria-label*="Unlike"], svg[aria-label*="Like"]'),
          ...document.querySelectorAll('button[aria-label*="Unlike"], button[aria-label*="Like"]')
        ];
        console.log(`Likes attempt ${attempts}: Total possible hearts: ${possibleButtons.length}`);
        
        for (let btn of possibleButtons) {
          if (btn.offsetParent !== null) { // Visible
            simulateHover(btn); // Hover to activate unlike
            await new Promise(r => setTimeout(r, 300)); // Wait for state change
            if (btn.getAttribute('data-testid') === 'unlike' || btn.querySelector('svg[aria-label*="Unlike"]')) {
              actionButton = btn;
              targetItem = btn.closest('[data-testid="tweet"]') || btn.closest('article');
              console.log('❤️ Visible unlike button activated!');
              break;
            }
          }
        }

        if (actionButton) {
          actionButton.click();
          action_count++;
          console.log(`❤️ Unliked #${action_count}`);
          await new Promise(r => setTimeout(r, 800)); // Quick
          if (targetItem) targetItem.style.display = 'none';
          continue;
        } else {
          console.log('No visible unlike after hover. Trying next scroll...');
        }
      } else if (tab === 'replies') {
        // Comment delete (same as posts but reply-specific)
        const tweetElements = [...document.querySelectorAll('[data-testid="tweet"]')];
        for (let tweet of tweetElements) {
          const moreButton = tweet.querySelector('[data-testid="caret"], [aria-label="More"]');
          if (moreButton && moreButton.offsetParent !== null) {
            targetItem = tweet;
            actionButton = moreButton;
            break;
          }
        }
        // Rest same as posts...
      } else {
        // Posts: Fast unretweet + delete (menu shows normally)
        const tweetElements = [...document.querySelectorAll('[data-testid="tweet"]')];
        for (let tweet of tweetElements) {
          const unretweetBtn = tweet.querySelector('[data-testid="unretweet"]');
          if (unretweetBtn && unretweetBtn.offsetParent !== null) {
            unretweetBtn.click(); // Direct, no menu
            const confirmURT = document.querySelector('[data-testid="unretweetConfirm"]');
            if (confirmURT) {
              confirmURT.click();
              action_count++;
              console.log(`🔄 Direct unretweet #${action_count} (no menu, fast)`);
              await new Promise(r => setTimeout(r, 600));
              continue;
            }
          } else {
            const moreButton = tweet.querySelector('[data-testid="caret"], [aria-label="More"]');
            if (moreButton && moreButton.offsetParent !== null) {
              targetItem = tweet;
              actionButton = moreButton;
              break;
            }
          }
        }
      }

      if (actionButton && actionButton !== unretweetBtn && !isUnretweet) { // For delete (menu shows)
        actionButton.click();
        await new Promise(r => setTimeout(r, 500)); // Quick menu

        const deleteOption = findDeleteOption(tab === 'replies');
        if (!deleteOption) {
          document.body.click();
          if (targetItem) targetItem.style.display = 'none';
          continue;
        }

        deleteOption.click(); // Menu shows here, normal
        await new Promise(r => setTimeout(r, 500));

        let confirmBtn = document.querySelector('[data-testid="confirmationSheetConfirm"]');
        if (!confirmBtn) {
          const buttons = document.querySelectorAll('button, div[role="button"]');
          for (let btn of buttons) {
            const text = btn.textContent.toLowerCase();
            if (text.includes('delete') && btn.offsetParent !== null) {
              confirmBtn = btn;
              break;
            }
          }
        }

        if (confirmBtn) {
          confirmBtn.click();
          action_count++;
          console.log(`${tab === 'replies' ? '💬' : '🗑️'} Deleted #${action_count} (menu normal, faster)`);
          await new Promise(r => setTimeout(r, 600));
          if (targetItem) targetItem.style.display = 'none';
        } else {
          document.body.click();
          console.log('Confirm missed.');
        }
      }

      // Super fast delay: 1-1.5 sec
      const delay = 1000 + Math.random() * 500;
      await new Promise(r => setTimeout(r, delay));

      if (action_count % 3 === 0) {
        console.log(`⚡ ${tab} progress: ${action_count} (1-1.5 sec/action)`);
      }

      // Hide distractions
      document.querySelectorAll('[data-testid="sidebarColumn"] > div').forEach(div => div.style.display = 'none');

    } catch (error) {
      console.error(`Error #${attempts}:`, error.message);
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log(`🎉 ${tab} done! Total: ${action_count}. Unlike fixed—check logs.`);
};

// Start
setTimeout(() => deleteTweets().catch(e => console.error('Error:', e)), 1000);

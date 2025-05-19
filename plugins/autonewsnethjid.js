const { cmd } = require("../command");
const axios = require("axios");

// Neth News API
const nethNewsApi = "https://suhas-bro-api.vercel.app/news/nethnews";

// Store multiple auto-news groups
let autoNewsGroups = {}; // { [groupJid]: { interval, lastTitle } }

cmd(
  {
    pattern: "autonewsnethjid",
    react: "🗂️",
    desc: "Enable/Disable auto news for a specific group by JID",
    category: "utility",
    filename: __filename,
  },
  async (client, mek, m, { args, reply }) => {
    const [groupJid, action] = args;

    if (!groupJid || !action || !["on", "off"].includes(action.toLowerCase())) {
      return reply(
        `❌ *Invalid usage!*\n\n` +
        `✅ To enable: *.autonewsneth <groupJid> on*\n` +
        `❌ To disable: *.autonewsneth <groupJid> off*`
      );
    }

    if (action.toLowerCase() === "on") {
      if (autoNewsGroups[groupJid]) {
        return reply(`⚠️ Auto news already enabled for *${groupJid}*`);
      }

      // Fetch initial news
      const latestNews = await fetchNews(nethNewsApi);
      if (!latestNews) return reply("❌ Failed to fetch news.");

      await sendNews(client, groupJid, latestNews, "NETH", mek);
      autoNewsGroups[groupJid] = {
        interval: setInterval(async () => {
          const news = await fetchNews(nethNewsApi);
          if (news && news.title !== autoNewsGroups[groupJid].lastTitle) {
            await sendNews(client, groupJid, news, "NETH", mek);
            autoNewsGroups[groupJid].lastTitle = news.title;
          }
        }, 300000), // Every 5 min
        lastTitle: latestNews.title,
      };

      return reply(`✅ Auto Neth News enabled for *${groupJid}* ✅`);

    } else if (action.toLowerCase() === "off") {
      if (!autoNewsGroups[groupJid]) {
        return reply(`⚠️ No active auto news for *${groupJid}*`);
      }

      clearInterval(autoNewsGroups[groupJid].interval);
      delete autoNewsGroups[groupJid];

      return reply(`❌ Auto Neth News disabled for *${groupJid}* ❌`);
    }
  }
);

// News fetch helper
async function fetchNews(apiUrl) {
  try {
    const { data } = await axios.get(apiUrl);
    return data?.result || null;
  } catch (err) {
    console.error("Fetch Error:", err.message);
    return null;
  }
}

// Send news helper
async function sendNews(client, groupJid, news, source, quoted) {
  try {
    const imageUrl =
      news.image?.match(/\.(jpg|jpeg|png|gif)$/i) ? news.image : null;

    const content = {
      caption: `
*📰 ${news.title} (${source})*

📅 *Date:* ${news.date || "N/A"}
📝 *Description:* ${news.desc || "No description"}
🔗 *Read More:* ${news.url || "N/A"}

*📢 CHAMA-MD Auto News*
      `.trim(),
    };

    if (imageUrl) content.image = { url: imageUrl };

    await client.sendMessage(groupJid, content, { quoted });
  } catch (e) {
    console.error("Send Error:", e.message);
  }
}

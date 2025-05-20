const { cmd } = require("../command");
const axios = require("axios");

// News sources
const newsSources = {
  hiru: "https://suhas-bro-api.vercel.app/news/hiru",
  derana: "https://suhas-bro-api.vercel.app/news/derana",
  dasatha: "https://suhas-bro-api.vercel.app/news/dasathalankanews",
  gossip: "https://suhas-bro-api.vercel.app/news/gossiplankanews",
  lankadeepa: "https://suhas-bro-api.vercel.app/news/lankadeepa",
  neth: "https://suhas-bro-api.vercel.app/news/nethnews",
  silumina: "https://suhas-bro-api.vercel.app/news/silumina",
  sirasa: "https://suhas-bro-api.vercel.app/news/sirasa",
};

// Auto-news tracker
let autoNewsGroups = {}; // { [groupJid]: { interval, lastTitles: {source: title} } }

cmd(
  {
    pattern: "autonews20",
    react: "📰",
    desc: "Enable/Disable auto news from all sources for a group",
    category: "utility",
    filename: __filename,
  },
  async (client, mek, m, { args, reply }) => {
    const [groupJid, action] = args;

    if (!groupJid || !action || !["on", "off"].includes(action.toLowerCase())) {
      return reply(
        `❌ *Invalid usage!*\n\n` +
        `✅ To enable: *.autonews <groupJid> on*\n` +
        `❌ To disable: *.autonews <groupJid> off*`
      );
    }

    if (action.toLowerCase() === "on") {
      if (autoNewsGroups[groupJid]) {
        return reply(`⚠️ Auto news already enabled for *${groupJid}*`);
      }

      autoNewsGroups[groupJid] = {
        interval: setInterval(() => fetchAndSendAllNews(client, groupJid, mek), 300000),
        lastTitles: {},
      };

      await fetchAndSendAllNews(client, groupJid, mek);
      return reply(`✅ Auto News from all sources enabled for *${groupJid}* ✅`);

    } else {
      if (!autoNewsGroups[groupJid]) {
        return reply(`⚠️ No active auto news for *${groupJid}*`);
      }

      clearInterval(autoNewsGroups[groupJid].interval);
      delete autoNewsGroups[groupJid];

      return reply(`❌ Auto News disabled for *${groupJid}* ❌`);
    }
  }
);

// Fetch and send all sources
async function fetchAndSendAllNews(client, groupJid, quoted) {
  for (const [source, apiUrl] of Object.entries(newsSources)) {
    try {
      const news = await fetchNews(apiUrl);
      if (!news) continue;

      const lastTitle = autoNewsGroups[groupJid]?.lastTitles?.[source];
      if (news.title !== lastTitle) {
        await sendNews(client, groupJid, news, source.toUpperCase(), quoted);
        autoNewsGroups[groupJid].lastTitles[source] = news.title;
      }
    } catch (e) {
      console.error(`Error fetching ${source}:`, e.message);
    }
  }
}

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

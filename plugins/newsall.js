const { cmd } = require("../command");
const axios = require("axios");

const newsApis = {
  DERANA: process.env.DERANA_API || "https://suhas-bro-api.vercel.app/news/derana",
  HIRU: process.env.HIRU_API || "https://suhas-bro-apii.vercel.app/hiru",
  BBC: process.env.BBC_API || "https://suhas-bro-api.vercel.app/news/bbc",
  LANKADEEPA: process.env.LANKADEEPA_API || "https://suhas-bro-api.vercel.app/news/lankadeepa",
  ITN: process.env.ITN_API || "https://suhas-bro-api.vercel.app/news/itn",
  SIYATHA: process.env.SIYATHA_API || "https://suhas-bro-api.vercel.app/news/siyatha",
  LANKANEWS: process.env.LANKANEWS_API || "https://suhas-bro-api.vercel.app/news/derana",
  GOSSIPLANKA: process.env.GOSSIPLANKA_API || "https://suhas-bro-api.vercel.app/news/gossiplankanews",
  TECH: process.env.TECH_API || "https://apis.davidcyriltech.my.id/random/technews",
  NETH: process.env.NETH_API || "https://suhas-bro-api.vercel.app/news/nethnews"
};

let interval = null;
let sentTitles = {};
let autoNewsGroupId = null;

cmd({
  pattern: "autonews1",
  alias: ["autonewsall"],
  react: "📰",
  desc: "Enable/Disable auto news updates from all sources",
  category: "utility",
  filename: __filename,
}, async (robin, mek, m, { from, args, reply, isGroup }) => {
  const action = args[0]?.toLowerCase();
  
  if (action === "on") {
    if (interval) return reply("❌ Already Running!");

    if (!isGroup) return reply("❌ Use this only in a group!");

    autoNewsGroupId = from;
    reply("✅ Auto News Enabled! All sources will be checked every 5 mins.");

    interval = setInterval(async () => {
      for (let [source, url] of Object.entries(newsApis)) {
        try {
          const res = await axios.get(url);
          const news = res.data?.result;
          if (!news || !news.title) continue;

          // Avoid sending duplicate titles
          if (sentTitles[source] === news.title) continue;
          sentTitles[source] = news.title;

          const image = news.image || news.img;
          const caption = `
*📰 ${news.title} (${source})*

📅 *Date:* ${news.date || "N/A"}
📝 *Description:* ${news.desc || "N/A"}
🔗 *Link:* ${news.url || news.link || "N/A"}

*CHAMA-MD Auto News*
          `;

          const msg = image?.match(/\.(jpg|jpeg|png|gif)$/i)
            ? { image: { url: image }, caption }
            : { text: caption };

          await robin.sendMessage(autoNewsGroupId, msg, { quoted: mek });

        } catch (e) {
          console.log(`❌ ${source} fetch error:`, e.message);
        }
      }
    }, 300000); // every 5 min

  } else if (action === "off") {
    if (!interval) return reply("❌ Auto news not running!");

    clearInterval(interval);
    interval = null;
    autoNewsGroupId = null;
    sentTitles = {};
    return reply("✅ Auto News Disabled.");
  } else {
    return reply("❌ Use `.autonews1 on` or `.autonews1 off`");
  }
});

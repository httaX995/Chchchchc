const config = require('../config');
const { cmd } = require('../command');
const DY_SCRAP = require('@dark-yasiya/scrap');
const dy_scrap = new DY_SCRAP();

function replaceYouTubeID(url) {
    const regex = /(?:youtube\.com\/(?:.*v=|.*\/)|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

cmd({
    pattern: "play3",
    alias: ["mp3", "ytmp3", "psong"],
    react: "🎵",
    desc: "Download Ytmp3",
    category: "download",
    use: ".song <Text or YT URL>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a Query or Youtube URL!");

        let id = q.startsWith("https://") ? replaceYouTubeID(q) : null;

        if (!id) {
            const searchResults = await dy_scrap.ytsearch(q);
            if (!searchResults?.results?.length) return await reply("❌ No results found!");
            id = searchResults.results[0].videoId;
        }

        const data = await dy_scrap.ytsearch(`https://youtube.com/watch?v=${id}`);
        if (!data?.results?.length) return await reply("❌ Failed to fetch video!");

        const { url, title, image, timestamp, ago, views, author } = data.results[0];

        let info = `🍄 *𝚂𝙾𝙽𝙶 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁* 🍄\n\n` +
            `🎵 *Title:* ${title || "Unknown"}\n` +
            `⏳ *Duration:* ${timestamp || "Unknown"}\n` +
            `👀 *Views:* ${views || "Unknown"}\n` +
            `🌏 *Release Ago:* ${ago || "Unknown"}\n` +
            `👤 *Author:* ${author?.name || "Unknown"}\n` +
            `🖇 *Url:* ${url || "Unknown"}\n\n` +
            `📊 *Choose your format from the poll below!*\n\n` +
            `${config.FOOTER || "𓆩chamindu𓆪"}`;

        // Send thumbnail and info
        const sentInfo = await conn.sendMessage(from, {
            image: { url: image },
            caption: info
        }, { quoted: mek });

        // Send poll
        const poll = await conn.sendMessage(from, {
            poll: {
                name: `🎵 Choose format for: ${title}`,
                values: ["1. Audio Type 🎵", "2. Document Type 📁"],
                selectableCount: 1
            }
        }, { quoted: mek });

        const pollID = poll?.pollCreationMessageKey?.id || poll?.key?.id;

        // Listen for poll votes
        conn.ev.on('messages.upsert', async ({ messages }) => {
            try {
                const vote = messages?.[0]?.message?.pollUpdateMessage;
                const pollKey = messages?.[0]?.key;

                if (!vote || vote.pollCreationMessageKey?.id !== pollID) return;

                const selected = vote.selectedOptions[0]; // e.g., "1. Audio Type 🎵"

                const downloading = await conn.sendMessage(from, { text: "⏳ Downloading..." }, { quoted: mek });
                const response = await dy_scrap.ytmp3(`https://youtube.com/watch?v=${id}`);
                const downloadUrl = response?.result?.download?.url;

                if (!downloadUrl) return await reply("❌ Download link not found!");

                let mediaOptions;

                if (selected.startsWith("1.")) {
                    mediaOptions = { audio: { url: downloadUrl }, mimetype: "audio/mpeg" };
                } else if (selected.startsWith("2.")) {
                    mediaOptions = { document: { url: downloadUrl }, mimetype: "audio/mpeg", fileName: `${title}.mp3`, caption: title };
                } else {
                    return await reply("❌ Invalid selection.");
                }

                await conn.sendMessage(from, mediaOptions, { quoted: mek });
                await conn.sendMessage(from, { text: "✅ Media sent successfully!", edit: downloading.key });

            } catch (err) {
                console.error("Poll Vote Error:", err);
                await reply("❌ Error handling poll vote!");
            }
        });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        await reply(`❌ *An error occurred:* ${error.message || "Error!"}`);
    }
});

const { cmd, commands } = require('../command');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms)); // Delay function

cmd({
  pattern: "push",
  alias: [],
  use: ".push <message>",
  react: "✉️",
  desc: "Group එකේ හැමෝටම inbox msg/Media + Contact Card යවන්න (safe delay)",
  category: "group",
  filename: __filename
}, async (conn, m, mek, { participants, reply }) => {
  try {
    // Check if the command is used inside a group
    if (!m.isGroup) {
      return await reply("මෙම command එක group එකක් තුළ විතරයි භාවිතා කරන්න.");
    }

    // Get all participant JIDs
    const mentionedJids = participants.map(u => u.id);

    // Extract caption/message from the command text
    const caption = (m.message?.extendedTextMessage?.text || m.body || "")
      .replace(/^\.push\s+/i, "")
      .trim();

    // Download media buffer if message is image, video or audio
    const buffer = (m.mtype === 'imageMessage' || m.mtype === 'videoMessage' || m.mtype === 'audioMessage') 
      ? await m.download() 
      : null;

    let sentCount = 0;

    // Loop through each participant and send message + contact card
    for (const jid of mentionedJids) {
      const member = participants.find(u => u.id === jid);
      const name = member?.name || member?.notify || jid.split('@')[0];
      const number = jid.split('@')[0];

      // 1. Send media or text message
      if (buffer) {
        if (m.mtype === 'imageMessage') {
          await conn.sendMessage(jid, { image: buffer, caption });
        } else if (m.mtype === 'videoMessage') {
          await conn.sendMessage(jid, { video: buffer, caption });
        } else if (m.mtype === 'audioMessage') {
          await conn.sendMessage(jid, { audio: buffer, mimetype: 'audio/mp4', ptt: true });
        }
      } else if (caption) {
        await conn.sendMessage(jid, { text: caption }, { quoted: mek });
      }

      // 2. Send contact card (vCard)
      const vcard = 
        `BEGIN:VCARD\n` +
        `VERSION:3.0\n` +
        `FN:${name}\n` +
        `TEL;type=CELL;type=VOICE;waid=${number}:${number}\n` +
        `END:VCARD`;

      await conn.sendMessage(jid, {
        contacts: {
          displayName: name,
          contacts: [{ vcard }]
        }
      });

      sentCount++;

      // Safe delay between each message to avoid flood blocking
      await delay(60000); // 60000 milliseconds = 1 minute

    }

    // Send confirmation message to group chat
    await conn.sendMessage(m.chat, { text: `✅ Messages sent to ${sentCount} members!`, quoted: mek });

  } catch (err) {
    console.error("*ERROR* :", err);
    await reply("*ERROR*");
    await conn.sendMessage(m.chat, { react: { text: '❌', key: mek.key } });
  }
});

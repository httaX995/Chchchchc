

const { cmd, commands } = require('../command');

cmd({
  pattern: "push",
  alias: [],
  use: ".push <message>",
  react: "✉️",
  desc: "Group එකේ හැමෝටම inbox msg/Media යවන්න + vCard (Save Contact)",
  category: "group",
  filename: __filename
}, async (conn, m, mek, { participants, reply }) => {
  try {
    if (!m.isGroup)
      return await reply("මෙම command එක group එකක් තුළ විතරයි භාවිතා කරන්න.");

    const mentionedJids = participants.map(u => u.id);
    const caption = (m.message?.extendedTextMessage?.text || m.body || "").replace(/^\.push\s+/i, "").trim();

    const buffer = (m.mtype === 'imageMessage' || m.mtype === 'videoMessage' || m.mtype === 'audioMessage') 
      ? await m.download()
      : null;

    for (let jid of mentionedJids) {
      const member = participants.find(u => u.id === jid);
      const name = member?.name || member?.notify || jid.split('@')[0];
      const number = jid.split('@')[0];

      // 1. Send Media or Text Message
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

      // 2. Send vCard Contact
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
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: mek.key } });

  } catch (err) {
    console.error("*ERROR* :", err);
    await reply("*ERROR*");
    await conn.sendMessage(m.chat, { react: { text: '❌', key: mek.key } });
  }
});

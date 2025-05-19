const fetch = require('node-fetch');
const config = require('../config');
const { cmd } = require('../command');

cmd({
    pattern: "repo",
    alias: ["sc", "script", "info"],
    desc: "Fetch GitHub repository information",
    react: "📂",
    category: "info",
    filename: __filename,
},
async (conn, mek, m, { from, reply }) => {
    const githubRepoURL = 'https://github.com/CHAMA2008/CHAMINDU-V1';

    try {
        const [, username, repoName] = githubRepoURL.match(/github\.com\/([^/]+)\/([^/]+)/);
        const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`);
        
        if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
        const repoData = await response.json();

        // Format 1: Classic Box
        const style1 = `╭───『 CHAMA-MD-V1 REPO 』───⳹
│
│ 📦 *Repository*: ${repoData.name}
│ 👑 *Owner*: ${repoData.owner.login}
│ ⭐ *Stars*: ${repoData.stargazers_count}
│ ⑂ *Forks*: ${repoData.forks_count}
│ 🔗 *URL*: ${repoData.html_url}
│
│ 📝 *Description*:
│ ${repoData.description || 'No description'}
│
╰────────────────⳹
> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ chamindu*`;

        // Format 2: Minimalist
        const style2 = `•——[ GITHUB INFO ]——•
  │
  ├─ 🏷️ ${repoData.name}
  ├─ 👤 ${repoData.owner.login}
  ├─ ✨ ${repoData.stargazers_count} Stars
  ├─ ⑂ ${repoData.forks_count} Forks
  │
  •——[ CHAMINDU-V1 ]——•
 > *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ chamindu*`;

        // Format 3: Fancy Borders
        const style3 = `▄▀▄▀▄ REPOSITORY INFO ▄▀▄▀▄

  ♢ *Project*: ${repoData.name}
  ♢ *Author*: ${repoData.owner.login}
  ♢ *Stars*: ${repoData.stargazers_count} ✨
  ♢ *Forks*: ${repoData.forks_count} ⑂
  ♢ *Updated*: ${new Date(repoData.updated_at).toLocaleDateString()}
  
  🔗 ${repoData.html_url}
  
 > *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ chamindu*}`;

        // Format 4: Code Style
        const style4 = `┌──────────────────────┐
│  ⚡ CHAMA-MD-V1 REPO  ⚡  │
├──────────────────────┤
│ • Name: ${repoData.name}
│ • Owner: ${repoData.owner.login}
│ • Stars: ${repoData.stargazers_count}
│ • Forks: ${repoData.forks_count}
│ • URL: ${repoData.html_url}
│ • Desc: ${repoData.description || 'None'}
└──────────────────────┘
> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ chamindu*`;

        // Format 5: Modern Blocks
        const style5 = `▰▰▰▰▰ REPO INFO ▰▰▰▰▰

  🏷️  *${repoData.name}*
  👨‍💻  ${repoData.owner.login}
  
  ⭐ ${repoData.stargazers_count}  ⑂ ${repoData.forks_count}
  🔗 ${repoData.html_url}
  
  📜 ${repoData.description || 'No description'}
  
  > *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ chamindu*`;

        // Format 6: Retro Terminal
        const style6 = `╔══════════════════════╗
║   CHAMA-MD-V1 REPO    ║
╠══════════════════════╣
║ > NAME: ${repoData.name}
║ > OWNER: ${repoData.owner.login}
║ > STARS: ${repoData.stargazers_count}
║ > FORKS: ${repoData.forks_count}
║ > URL: ${repoData.html_url}
║ > DESC: ${repoData.description || 'None'}
╚══════════════════════╝
> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ chamindu*`;

        // Format 7: Elegant
        const style7 = `┌───────────────┐
│  📂  REPO  │
└───────────────┘
│
│ *Project*: ${repoData.name}
│ *Author*: ${repoData.owner.login}
│
│ ✨ ${repoData.stargazers_count} Stars
│ ⑂ ${repoData.forks_count} Forks
│
│ 🔗 ${repoData.html_url}
│
┌───────────────┐
│  📝  DESC  │
└───────────────┘
${repoData.description || 'No description'}

> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ chamindu*`;

        // Format 8: Social Media Style
        const style8 = `✦ ${config.BOT_NAME} Repository ✦

📌 *${repoData.name}*
👤 @${repoData.owner.login}

⭐ ${repoData.stargazers_count} Stars | ⑂ ${repoData.forks_count} Forks
🔄 Last updated: ${new Date(repoData.updated_at).toLocaleDateString()}

🔗 GitHub: ${repoData.html_url}

${repoData.description || 'No description available'}

> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ chamindu*`;

        // Format 9: Fancy List
        const style9 = `╔♫═🎧═♫══════════╗
   ${config.BOT_NAME} REPO
╚♫═🎧═♫══════════╝

•・゜゜・* ✧  *・゜゜・•
 ✧ *Name*: ${repoData.name}
 ✧ *Owner*: ${repoData.owner.login}
 ✧ *Stars*: ${repoData.stargazers_count}
 ✧ *Forks*: ${repoData.forks_count}
•・゜゜・* ✧  *・゜゜・•

🔗 ${repoData.html_url}

${repoData.description || 'No description'}

> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ chamindu*`;

        // Format 10: Professional
        const style10 = `┏━━━━━━━━━━━━━━━━━━┓
┃  REPOSITORY REPORT  ┃
┗━━━━━━━━━━━━━━━━━━┛

◈ Project: ${repoData.name}
◈ Maintainer: ${repoData.owner.login}
◈ Popularity: ★ ${repoData.stargazers_count} | ⑂ ${repoData.forks_count}
◈ Last Update: ${new Date(repoData.updated_at).toLocaleDateString()}
◈ URL: ${repoData.html_url}

Description:
${repoData.description || 'No description provided'}

> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ chamindu*`;

        const styles = [style1, style2, style3, style4, style5, style6, style7, style8, style9, style10];
        const selectedStyle = styles[Math.floor(Math.random() * styles.length)];

        // Send image with repo info
        await conn.sendMessage(from, {
            image: { url: config.MENU_IMAGE_URL || 'https://files.catbox.moe/0eo2q4.jpg' },
            caption: selectedStyle,
            contextInfo: { 
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363419192353625@newsletter',
                    newsletterName: config.OWNER_NAME || '☈☟𝗖𝗛𝗔𝗠𝗔 𝗠𝗗 𝗩1️⃣',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

        // Send audio
        await conn.sendMessage(from, {
            audio: { url: 'https://github.com/Chamijd/KHAN-DATA/raw/refs/heads/main/autovoice/cm4ozo.mp3' },
            mimetype: 'audio/mp4',
            ptt: true,
            contextInfo: { 
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (error) {
        console.error("Repo command error:", error);
        reply(`❌ Error: ${error.message}`);
    }
});

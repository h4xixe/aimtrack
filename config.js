require('dotenv').config();

module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  risepay: {
    token: process.env.RISE_PAY_TOKEN,
    url: process.env.RISE_PAY_URL
  }
};

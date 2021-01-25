"use strict";
const fastify = require('fastify');
const { Telegraf } = require('telegraf');
const telegrafPlugin = require('fastify-telegraf');

const BOT_TOKEN = '*:*';

const SECRET_PATH = '/__tgbot';
const WEBHOOK_URL = 'https://url:443/__tgbot';

const LOCAL_IP_BINDING = '0.0.0.0';
const LOCAL_PORT_BINDING = 3000;


const bot = new Telegraf(BOT_TOKEN, { telegram: { webhookReply: false/* , apiRoot: 'https://botapi.giuseppem99.xyz' */ } });
const app = fastify();

let forwardOnlyId = 1234;
let chatToId = 12345;
let chatFromId = 123456;


app.register(telegrafPlugin, { bot, path: SECRET_PATH });

const g_szCommandSymbols = '/!';
const g_szCommandFrom = 'f';
const g_szCommandTo = 't';
const g_szCommandOnly = 'o';

/* let g_iMessageCounter = 0; */

try {
	app.listen({ port: LOCAL_PORT_BINDING, host: LOCAL_IP_BINDING }, (err, address) => {
		if (err) throw err;

		bot.telegram.deleteWebhook(true).then(() => {
			bot.telegram.setWebhook(WEBHOOK_URL).then(async () => {
				bot.on('text', async (ctx, next) => {
					try{
						let text = ctx.update.message.text;

						if(text[0] !== g_szCommandSymbols[0] || text.length < 3 || text[1] !== g_szCommandSymbols[1]) {
							text = undefined;
							return next();
						}

						text = text.slice(2);

						text = text.split(' ');
						if(text.length < 2) {
							text = undefined;
							return next();
						}

						let cCmd = text[0];
						let iParam = undefined;

						if(cCmd === g_szCommandFrom) {
							iParam = text[1] - 0;
							if(isFinite(iParam) && !isNaN(iParam)) chatFromId = iParam;
						}
						else if(cCmd === g_szCommandTo) {
							iParam = text[1] - 0;
							if(isFinite(iParam) && !isNaN(iParam)) chatToId = iParam;
						}
						else if(cCmd === g_szCommandOnly) {
							iParam = text[1] - 0;
							if(isFinite(iParam) && !isNaN(iParam)) forwardOnlyId = iParam;
						}

						iParam = undefined;
						cCmd = undefined;
						text = undefined;
					}
					catch (e) {
						console.log(e);
					}
				});

				bot.on('message', async (ctx, next) => {
					try {
						/* console.log('update message is', ctx); */
						let message = ctx && ctx.update && ctx.update.message;
						if (message) {
							if (message.chat && message.chat.id !== chatFromId
								|| message.from && (message.from.is_bot || forwardOnlyId && message.from.id !== forwardOnlyId)) {
								next();
								return;
							}

							/* g_iMessageCounter++; */
							/* console.log('updates recived', g_iMessageCounter); */

							/* let a =  */await ctx.copyMessage(chatToId);
							/* console.log(a); */
						}
					}
					catch (e) {
						console.log('err is', e);
					}
				});

			});
		});
	});
}
catch (e) {
	console.error(e);
}

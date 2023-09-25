// @ts-check
import WebSocket from 'ws';
import fs from 'fs';
import { format } from 'date-fns';
const timeout = (to) => new Promise((r) => setTimeout(r, to));

const connect = async () => {
	const wsCon = new WebSocket('ws://104.225.216.174:8079/socket');
	wsCon.on('error', console.error);
	wsCon.on('close', () => console.log('close'));

	const openPr = new Promise((ok) => {
		wsCon.on('open', function open() {
			//   ws.send('something');
			console.log('received: open');
			ok();
		});
	});

	await openPr;

	return {
		ws: wsCon,
		sendMessage(jsonObjectMessage) {
			wsCon.send(Buffer.from(JSON.stringify(jsonObjectMessage), 'utf-8'));
		}
	};
};

function makeLeaderboardMessage(columnName, page) {
	return {
		type: 0x5,
		data: {
			columnName,
			page
		}
	};
}

const columns = [
	{
		slug: 'highestArea',
		label: 'Highest Area'
	},
	{
		slug: 'potatoesKilled',
		prop: 'potatoKilled',
		label: 'PotatoesKilled'
	},
	{
		slug: 'reincarnationLevel',
		label: 'reincarnationLevel'
	},
	{
		slug: 'classesLevel',
		label: 'classesLevel'
	},
	{
		slug: 'itemRatingMax',
		label: 'itemRatingMax'
	},
	{
		slug: 'wormsQty',
		label: 'wormsQty'
	},
	{
		slug: 'larvaQty',
		label: 'larvaQty'
	},
	{
		slug: 'silkQty',
		label: 'silkQty'
	},
	{
		slug: 'cowQty',
		label: 'cowQty'
	},
	{
		slug: 'ascensionCount',
		label: 'ascensionCount'
	},
	{
		slug: 'whackScore',
		label: 'whackScore'
	},
	{
		slug: 'petUnlocked',
		label: 'petUnlocked'
	},
	{
		slug: 'petLevel',
		label: 'petLevel'
	},
	{
		slug: 'petRank',
		label: 'petRank'
	},
	{
		slug: 'hourInExpedition',
		label: 'hourInExpedition'
	},
	{
		slug: 'expeditionWave',
		label: 'expeditionWave'
	},
	{
		slug: 'cardLevel',
		label: 'cardLevel'
	},
	{
		slug: 'healthyPotato',
		label: 'healthyPotato'
	},
	{
		slug: 'fries',
		label: 'fries'
	},
	{
		slug: 'totalContagion',
		label: 'totalContagion'
	},
	{
		slug: 'totalAssemblyLine',
		label: 'totalAssemblyLine'
	}
];

async function downloadColumn(columnName, dateStr) {
	const entries = [];
	const ws = await connect();

	for await (const results of getStreamLeaderboard({
		ws,
		start: 0,
		end: 15,
		columnName
	})) {
		entries.push(...results);
	}

	fs.writeFileSync(
		`./data/${dateStr}/${columnName}-${dateStr}.json`,
		JSON.stringify(entries, 0, 2),
		'utf-8'
	);

	fs.writeFileSync(`./static/latest/${columnName}.json`, JSON.stringify(entries, 0, 2), 'utf-8');
	console.log(entries.length);
}

async function init() {
	const dateStr = format(new Date(), 'yyyy-MM-dd-HH-mm');
	fs.mkdirSync(`./data/${dateStr}`);
	fs.writeFileSync(`./static/columns.json`, JSON.stringify(columns, 0, 2), 'utf-8');
	for (const { slug } of columns) {
		await downloadColumn(slug, dateStr);
	}
}

async function* getStreamLeaderboard({ ws, start, end, columnName }) {
	let results = [];
	let resolve;
	let promise1 = new Promise((r) => (resolve = r));
	let promise = Promise.race([promise1, timeout(2000)]);

	const onData = (data) => {
		const message = JSON.parse(data);
		switch (message.type) {
			case 'SEND_LEADERBOARD':
				{
					results.push(message.data.entries);
					// console.info(message.data);
					resolve();
					promise1 = new Promise((r) => (resolve = r));
					promise = Promise.race([promise1, timeout(2000)]);
					console.info('received message', columnName);
				}
				break;
		}
	};

	ws.ws.on('message', onData);
	// ws.on('close', () => (done = true));

	let cpt = start;

	while (cpt < end) {
		console.info('asking page ' + cpt);
		ws.sendMessage(makeLeaderboardMessage(columnName, cpt));
		await promise;
		yield* results;
		cpt += 1;
		results = [];
	}

	ws.ws.close();
}

init();

const { createReadStream } = require('fs');
const { appendFile, readFile, writeFile } = require('fs/promises');
const readline = require('readline');

const workdir = '/home/proxy';

const sleep = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
})

const run = async () => {
    const modulesLogFile = `${workdir}/modules.log`;
    const statsFile = `${workdir}/stats.json`;
    let stats = {};
    try {
        stats = JSON.parse(await readFile(statsFile, 'utf8'));
    } catch (e) {
        // create stat.json if does not exist
        await writeFile(statsFile, '{}');
    }

    const readLine = readline.createInterface({
        input: createReadStream(modulesLogFile)
    });

    let processed = 0;
    for await (const line of readLine) {
        const log = JSON.parse(line.replace(/\x00/g, ''));
        if (log.module) {
            stats[log.module] = stats[log.module] + 1 || 1;
            processed += 1;
        }
    }

    if (processed === 0) {
        return;
    }

    // write processed statistics back to stats.json
    await writeFile(statsFile, JSON.stringify(stats));
    // write processed logs into the corresponding file and clear module.log
    const DMY = (new Date()).toISOString().slice(0, 10);
    const logs = await readFile(modulesLogFile, 'utf8');
    await writeFile(modulesLogFile, '');
    await appendFile(`${workdir}/modules.log.processed.${DMY}`, logs);
};

(async () => {
    while (true) {
        try {
            await run();
        } catch (e) {
            console.error(e);
        }
        await sleep(60000); // sleep 60 seconds
    }
})();

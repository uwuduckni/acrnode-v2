const axios = require("axios");

const username = process.env.username;
const password = process.env.password;

async function repeat(n) {
    try {
        let response = await auth();

        let token = response.data.token;
        console.log(response.data)
        response = await timedBonus(token);
        if (response) {
            console.log(response.data);
            timestamp = new Date();
            resclock.push(n)
        }

    } catch (err) {
        console.log('repeat error' + err);
        return err;
    }
    return;
}

async function timedBonus(token) {
    let headers = {
        authorization: "Bearer " + token,
    };
    let ops = '\x22\x7B\x7D\x22';
    let res = await axios.post(
        "https://dev-nakama.winterpixel.io/v2/rpc/collect_timed_bonus",
        ops,
        { headers: headers },
    );
    return res;
}

async function auth() {
    let payload = {
        email: username,
        password: password,
        vars: {
            client_version: "99999",
        },
    };
    let res = await axios.post(
        "https://dev-nakama.winterpixel.io/v2/account/authenticate/email?create=false",
        payload,
        {
            headers: {
                Authorization: `Basic OTAyaXViZGFmOWgyZTlocXBldzBmYjlhZWIzOTo=`,
                "Content-Type": "application/json",
            },
        },
    );
    return res;
}

module.exports = async (req, res) => {
    let timestamp = "None";

    // Handle CORS if needed
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Handle different endpoints
    if (req.url === '/') {
        let time = timestamp.toLocaleString("en-US", {
            timeZone: "America/Los_Angeles"
        });

        res.send("Bot status: Active<br>Last request: " + time + '<br>' + `[${resclock.join(', ')}]`);
    } else if (req.url === '/end') {
        let a = false;
        let b = false;
        try {
            b = await repeat(2);
        } catch (e) {
            a = e;
        }
        res.send((a ? a : 'Completed') + '<br>' + (b ? b : 'No errors'));
    } else {
        res.status(404).send('Not found');
    }
};

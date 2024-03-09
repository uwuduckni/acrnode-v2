let axios = require("axios");

axios.interceptors.response.use(
  response => response,
  error => {
    // Handle error globally
    if (error.response) {
      console.error("Axios error:", error.response.data);
    } else {
      console.error("Axios error:", error.message);
    }
  }
);

const username = process.env.username;
const password = process.env.password;

let resclock = []; // Initialize the resclock array

async function repeat(n) {
  try {
    let response = await auth();

    let token = response.data.token;
    console.log(response.data)
    response = await timedBonus(token);
    if(response){
      console.log(response.data);
      let timestamp = new Date(); // Get current timestamp
      resclock.push(n); // Push n to the resclock array
      return { timestamp, resclock }; // Return timestamp and resclock
    }
  } catch(err) {
    console.log('repeat error', err);
    throw err; // Re-throw the error to handle it in the caller function
  }
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
  return res.data;
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
  return res.data;
}

// Export the repeat function to be used as a Netlify function
exports.handler = async (event, context) => {
  try {
    const result = await repeat(1); // Call repeat function when the serverless function is invoked
    const time = result.timestamp.toLocaleString("en-US", {
      timeZone: "America/Los_Angeles"
    });
    const responseMessage = `Bot status: Active<br>Last request: ${time}<br>[${result.resclock.join(', ')}]`;
    return {
      statusCode: 200,
      body: responseMessage,
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

const express = require('express')
const app = express()
const port = 3000;
var axios = require('axios');

const history = [];

try {
    init();
} catch (e) {
    console.log(e);
}

function init() {
    setInterval(function() {
        if (history.length % 2 == 0) {
            fetchVisa('https://coubic.com/api/v2/merchants/Embassy-of-Japan/booking_events?renderer=widgetCalendar&start=2023-03-05T00:00:00.000+08:00&end=2023-04-01T23:59:59.999+08:00&resource_public_ids=948169');
        }
        else if (history.length % 2 != 0) {
            fetchVisa('https://coubic.com/api/v2/merchants/Embassy-of-Japan/booking_events?renderer=widgetCalendar&start=2023-04-02T00:00:00.000+08:00&end=2023-05-06T23:59:59.999+08:00&resource_public_ids=948169');
        }
        console.log('fetch visa info, history: ' + history.length);
        if (history.length % 10 == 0) {
            sendSlack('try ' + history.length + ' times, no empty slot');
        }
    }, 3000);
}

async function fetchVisa(url) {
    try {
        const response = await axios.get(url);
        const slots = (response.data);
        history.push(slots.length);

        if (slots.length > 0 ) {
            sendSlack('there is ' + slots.length + " slots, \n https://coubic.com/Embassy-of-Japan/widget/calendar/948169?from_pc=month&from_sp=agendaThreeDay");
        }
    } catch (error) {
        console.error(error);
        sendSlack('error: ' + error);
    }
}

async function sendSlack(msg) {
    try {
        await axios.post(
            process.env.SLACK_WEBHOOK_HOST,
            { text: msg }
        );
    } catch (e) {
        console.error(e);
    }
}

app.get('/', (req, res) => {
  res.send('Hello World!' + JSON.stringify(history))
})

app.get('/webhook', async (req, res) => {
    await sendSlack('try ' + history.length + ' times');
    res.send('Hello World!' + JSON.stringify(history))
})

app.get('/visa-1', async (req, res) => {
    await fetchVisa('https://coubic.com/api/v2/merchants/Embassy-of-Japan/booking_events?renderer=widgetCalendar&start=2023-03-05T00:00:00.000+08:00&end=2023-04-01T23:59:59.999+08:00&resource_public_ids=948169');
    res.send('Hello World!' + JSON.stringify(history))
})

app.get('/visa-2', async (req, res) => {
    await fetchVisa('https://coubic.com/api/v2/merchants/Embassy-of-Japan/booking_events?renderer=widgetCalendar&start=2023-04-02T00:00:00.000+08:00&end=2023-05-06T23:59:59.999+08:00&resource_public_ids=948169');
    res.send('Hello World!' + JSON.stringify(history))
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


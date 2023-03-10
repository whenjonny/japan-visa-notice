const express = require('express')
const app = express()
const port = 3000;
var axios = require('axios');

const history = [];

try {
    (async function (){
        while(true){
            await tick(10000, 'https://coubic.com/api/v2/merchants/Embassy-of-Japan/booking_events?renderer=widgetCalendar&start=2023-03-05T00:00:00.000+08:00&end=2023-04-01T23:59:59.999+08:00&resource_public_ids=948169');
            await tick(10000, 'https://coubic.com/api/v2/merchants/Embassy-of-Japan/booking_events?renderer=widgetCalendar&start=2023-04-02T00:00:00.000+08:00&end=2023-05-06T23:59:59.999+08:00&resource_public_ids=948169');
        }
    })();
} catch (e) {
    console.log(e);
}

async function tick(timer, url){
    await fetchVisa(url);
    return new Promise(function(resolve, reject){
        setTimeout(function(){
            resolve();
        }, timer)
    })
}

async function fetchVisa(url) {
    try {
        console.log("before fetching visa info");
        const response = await axios.get(url);
        const slots = (response.data);
        history.push(slots.length);

        if (slots.length > 0 ) {
            sendSlack('there is ' + slots.length + " slots, \n https://coubic.com/Embassy-of-Japan/widget/calendar/948169?from_pc=month&from_sp=agendaThreeDay");
        }
        if (history.length % 10 == 0) {
            sendSlack('bot ' + history.length + ' tries.');
        }
        console.log("finish fetching visa info, slots: " + slots.length);
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


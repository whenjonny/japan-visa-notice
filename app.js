const express = require('express')
const app = express()
const port = 3000;
var request = require('request');

const history = [];

try {
    init();
} catch (e) {
    console.log(e);
}

function init() {
    setInterval(function() {
        fetchVisa('https://coubic.com/api/v2/merchants/Embassy-of-Japan/booking_events?renderer=widgetCalendar&start=2023-03-05T00:00:00.000+08:00&end=2023-04-01T23:59:59.999+08:00&resource_public_ids=948169');
        console.log('fetch visa info from 0305 ~ 0401, history: ' + history.length);
    }, 4000);

    setInterval(function() {
        fetchVisa('https://coubic.com/api/v2/merchants/Embassy-of-Japan/booking_events?renderer=widgetCalendar&start=2023-04-02T00:00:00.000+08:00&end=2023-05-06T23:59:59.999+08:00&resource_public_ids=948169');
        console.log('fetch visa info from 0402 ~ 0506, history: ' + history.length)
    }, 5000);

    setInterval(function() {
        request.post(
            'https://hooks.slack.com/services/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',
            { json: { text: 'try ' + history.length + ' times, no empty slot' }}
        );
    }, 3600000);
}

function fetchVisa(url) {
    //var url = 'https://coubic.com/api/v2/merchants/Embassy-of-Japan/booking_events?renderer=widgetCalendar&start=2023-03-05T00:00:00.000+08:00&end=2023-04-01T23:59:59.999+08:00&resource_public_ids=768296';
    console.log('fetch visa info start');
    request(url, function (error, response, body) {
        const slots = JSON.parse(body);
        history.push(slots.length);

        if (slots.length > 0 ) {
            request.post(
                process.env.SLACK_WEBHOOK_HOST,
                { json: { text: 'there is ' + slots.length + " slots, \n https://coubic.com/Embassy-of-Japan/widget/calendar/948169?from_pc=month&from_sp=agendaThreeDay" } },
            );
        }
        if (error) {
            console.log("error:", error);
            request.post(
                process.env.SLACK_WEBHOOK_HOST,
                { json: { text: 'error: ' + error } },
            );
        }
    });
}

app.get('/', (req, res) => {
  res.send('Hello World!' + JSON.stringify(history))
})


app.get('/webhook', (req, res) => {
    request.post(
        process.env.SLACK_WEBHOOK_HOST,
        { json: { text: 'try ' + history.length + ' times' }}
    );
    res.send('Hello World!' + JSON.stringify(history))
})

app.get('/visa-1', (req, res) => {
    fetchVisa('https://coubic.com/api/v2/merchants/Embassy-of-Japan/booking_events?renderer=widgetCalendar&start=2023-03-05T00:00:00.000+08:00&end=2023-04-01T23:59:59.999+08:00&resource_public_ids=948169');
    res.send('Hello World!' + JSON.stringify(history))
})

app.get('/visa-2', (req, res) => {
    fetchVisa('https://coubic.com/api/v2/merchants/Embassy-of-Japan/booking_events?renderer=widgetCalendar&start=2023-04-02T00:00:00.000+08:00&end=2023-05-06T23:59:59.999+08:00&resource_public_ids=948169');
    res.send('Hello World!' + JSON.stringify(history))
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})



import express from 'express';
import bodyParser from 'body-parser';
import twilio from 'twilio';
import cors from "cors";
import "dotenv/config";
import sendMessage from './utiles/whatsappSendMessage.mjs'
import textQueryRequestResponse from './utiles/DialogflowHelper.mjs'
import { WebhookClient, Card, Suggestion, Image, Payload } from 'dialogflow-fulfillment';

const app = express();
const PORT = process.env.PORT || 3000;
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: '*'
}));

app.get('/', (req, res) => {
    res.send("Server is running")
})

//! Twilio messeging end point
app.post("/twiliowebhook", (req, res) => {

    // console.log("req: ", JSON.stringify(req.body));

    console.log("message: ", req.body.Body);

   // TODO: ask dialogflow what to respond
   
   
    let twiml = new twilio.twiml.MessagingResponse()
    twiml.message('The Robots are coming! Head for the hills!');

    res.header('Content-Type', 'text/xml');
    res.send(twiml.toString());
})

//! Whatsapp webhook
app.post("/whatsappwebhook", (req, res) => {
    let message = req.body.Body;
    let senderID = req.body.From;

    console.log(`${message} --- ${senderID} --- ${process.env.TWILIO_NUMBER}`)

    sendMessage(twilioClient, "Hello From Pc", senderID, process.env.TWILIO_NUMBER)
})

//! Dialogflow response endpoint
app.post("/talktochatbot", async (req, res) => {

    const {responses} = await textQueryRequestResponse(
        process.env.DIALOGFLOW_PROJECT_ID,
        req.body.text,
        'en-US'
    )
   
    res.send({
        text: responses[0].queryResult.fulfillmentText
    });

})

//! Webhook endpoint for dialogflow
app.post("/dialogwebhook", async (req, res) => {

    const agent = new WebhookClient({ request: req, response: res });

    //! Wellcome intent
    function welcome(agent) {
        
        let image = new Image("https://media.nationalgeographic.org/assets/photos/000/263/26383.jpg");

        agent.add(image)

        // agent.add(` //ssml
        //     <speak>
        //         <prosody rate="slow" pitch="-2st">Can you hear me now?</prosody>
        //     </speak>
        // `);

        agent.add('Welcome to Saylani welfare.');
        agent.add('I am your virtual assistance what can I help you.!');
        agent.add(new Suggestion('Tell me about saylani welfare'));
        agent.add(new Suggestion('about saylani'));

        const facebookSuggestionChip = [{
            "content_type": "text",
            "title": "I am quick reply",
            // "image_url": "http://example.com/img/red.png",
            // "payload":"<DEVELOPER_DEFINED_PAYLOAD>"
        },
        {
            "content_type": "text",
            "title": "I am quick reply 2",
            // "image_url": "http://example.com/img/red.png",
            // "payload":"<DEVELOPER_DEFINED_PAYLOAD>"
        }]
        const payload = new Payload(
            'FACEBOOK',
            facebookSuggestionChip
        );
        agent.add(payload)

    }

    //! falback intent
    function fallback(agent) {
        agent.add('Woah! Its getting a little hot in here.');
        agent.add(`I didn't get that, can you try again?`);
    }

    let intentMap = new Map(); // Map functions to Dialogflow intent names
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    agent.handleRequest(intentMap);

})

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});

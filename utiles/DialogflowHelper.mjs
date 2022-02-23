import dialogflow from '@google-cloud/dialogflow';
const sessionClient = new dialogflow.SessionsClient();

const textQueryRequestResponse = async (projectId, queryText, languageCode) => {
    // const projectId = "saylani-class-delete-this"
    // const sessionId = "session123"
    // const query = req.body.text;
    // const languageCode = "en-US"
    console.log()
    // The path to identify the agent that owns the created intent.
    const sessionPath = sessionClient.projectAgentSessionPath(
        projectId,
        getSessionId()
    );

     // The text query request.
     const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: queryText,
                languageCode: languageCode,
            },
        },
    };
    const responses = await sessionClient.detectIntent(request);

    console.log("resp: ", responses[0].queryResult.fulfillmentText);

    return {responses}
}

const getSessionId = () => {
    return Math.floor(Math.random(1000)*10000000000).toString('16')
}

export default textQueryRequestResponse
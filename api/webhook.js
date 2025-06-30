const axios = require("axios");

module.exports = async (req, res) => {
  const body = req.body;
  const event = body.events?.[0];
  if (!event || event.type !== "message") return res.status(200).send("ok");

  const userMessage = event.message.text;
  const replyToken = event.replyToken;
  const userId = event.source.userId;

  // Dialogflow DetectIntent API呼び出し
  const dfResponse = await axios.post(
    `https://dialogflow.googleapis.com/v2/projects/YOUR_PROJECT_ID/agent/sessions/${userId}:detectIntent`,
    {
      queryInput: {
        text: {
          text: userMessage,
          languageCode: "ja"
        }
      }
    },
    {
      headers: {
        Authorization: `Bearer YOUR_DIALOGFLOW_ACCESS_TOKEN`
      }
    }
  );

  const replyText = dfResponse.data.queryResult.fulfillmentText;

  // LINEへ返信
  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [{ type: "text", text: replyText }]
    },
    {
      headers: {
        Authorization: `Bearer YOUR_LINE_CHANNEL_ACCESS_TOKEN`,
        "Content-Type": "application/json"
      }
    }
  );

  res.status(200).send("ok");
};

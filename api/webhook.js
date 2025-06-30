module.exports = async (req, res) => {
  try {
    const body = req.body;
    const event = body.events?.[0];
    if (!event || event.type !== "message") return res.status(200).send("ok");

    const userMessage = event.message.text;
    const replyToken = event.replyToken;
    const userId = event.source.userId;

    const dfRes = await axios.post(
      `https://dialogflow.googleapis.com/v2/projects/${process.env.PROJECT_ID}/agent/sessions/${userId}:detectIntent`,
      {
        queryInput: {
          text: { text: userMessage, languageCode: "ja" }
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DIALOGFLOW_ACCESS_TOKEN}`
        }
      }
    );

    const replyText = dfRes.data.queryResult.fulfillmentText;

    await axios.post(
      "https://api.line.me/v2/bot/message/reply",
      {
        replyToken,
        messages: [{ type: "text", text: replyText }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.status(200).send("ok");
  } catch (err) {
    console.error("エラー発生:", err.message);
    res.status(500).send("Internal Server Error: " + err.message);
  }
};

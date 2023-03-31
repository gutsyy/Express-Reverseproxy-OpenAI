import bodyParser from "body-parser";
import express, { response } from "express";
import axios from "axios";

const app = express();

app.use(bodyParser.json());

app.post("/*", (req, res) => {
  /** Request OpenAI API */
  axios
    .post(new URL(req.url, "https://api.openai.com/").toString(), req.body, {
      headers: {
        Authorization: req.headers.authorization,
        "Content-Type": "application/json",
      },
      responseType: req.body.stream ? "stream" : "json",
    })
    .then((response) => {
      if (response.status !== 200) {
        res.status(response.status).send(response.statusText);
      }
      if (!response.data) {
        res.status(200).send(response.data);
      }
      if (req.body.stream) {
        /** Handle EventSource */
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        });
        response.data.on("data", (chunk: string) => {
          const chunkString = chunk.toString();
          res.write(chunkString);
        });
      } else {
        /** Handle Common Post Request  */
        res.json(response.data);
      }
    });
});

app.listen(3001, () => {
  console.log("Server listening on Port 3001");
});

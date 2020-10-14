import * as functions from "firebase-functions";
import {
  WebClient,
  ContextBlock,
  SectionBlock,
  KnownBlock,
} from "@slack/web-api";
import { fromUnixTime } from "date-fns";
import { format, utcToZonedTime } from "date-fns-tz";
import fr from "date-fns/locale/fr";

const REGION = "europe-west1";

const SLACK_TOKEN = functions.config().slack.token;
const SLACK_CHANNEL = functions.config().slack.channel;
const slack = new WebClient(SLACK_TOKEN);

interface SendgridEvent {
  email: string;
  event: string;
  timestamp: number;
  reason?: string;
}

const timestampToZonedTime = (timestamp: number): string => {
  const parisTimeZone = "Europe/Paris";
  const date = fromUnixTime(timestamp);
  const parisDate = utcToZonedTime(date, parisTimeZone);
  return format(parisDate, "yyyy-MM-dd HH:mm:ss zzz", {
    timeZone: parisTimeZone,
    locale: fr,
  });
};

const parseSendgridEvents = (events: SendgridEvent[]) =>
  events.map((evt) => {
    const { email, event, timestamp, reason } = evt;
    const time = timestampToZonedTime(timestamp);
    return { email, event, reason, time };
  });

const slackPayload = ({
  event,
  time,
  email,
  reason,
}: Omit<SendgridEvent, "timestamp"> & { time: string }) => {
  const messageBlock: SectionBlock = {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `Email *${event}* for *${email}* at ${time}`,
    },
  };

  const errorBlock: ContextBlock = {
    type: "context",
    elements: [
      {
        type: "plain_text",
        text: `Reason: ${reason}`,
        emoji: true,
      },
    ],
  };

  let blocks: KnownBlock[] = [messageBlock];
  if (reason) blocks = [...blocks, errorBlock];
  return blocks;
};

const sendToSlack = (blocks: KnownBlock[]) => {
  slack.chat.postMessage({ channel: SLACK_CHANNEL, text: "", blocks });
};

export const process = functions.region(REGION).https.onRequest((req, res) => {
  if (req.body && Array.isArray(req.body)) {
    const events = parseSendgridEvents(req.body);
    events.forEach((event) => {
      const message = slackPayload(event);
      sendToSlack(message);
    });
    res.json({
      status: "success",
      message: `${events.length} events processed`,
    });
  } else {
    res.status(400).json({ status: "error", message: "Invalid payload" });
  }
});

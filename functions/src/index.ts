import * as functions from "firebase-functions";
import fetch from "node-fetch";
import { fromUnixTime } from "date-fns";
import { format, utcToZonedTime } from "date-fns-tz";
import fr from "date-fns/locale/fr";

const SLACK_WEBHOOK_URL =
  "https://hooks.slack.com/services/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";

interface SlackElement {
  type: string;
  text?: string;
  emoji?: boolean;
}

interface SlackBlock {
  type: string;
  text?: SlackElement;
  elements?: SlackElement[];
}

interface SlackPayload {
  blocks: SlackBlock[];
}

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
  const payload: SlackPayload = {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Email *${event}* for *${email}* at ${time}`,
        },
      },
    ],
  };

  const errorBlock: SlackBlock = {
    type: "context",
    elements: [
      {
        type: "plain_text",
        text: `Reason: ${reason}`,
        emoji: true,
      },
    ],
  };

  if (reason) payload.blocks = [...payload.blocks, errorBlock];
  return payload;
};

const sendToSlack = (message: SlackPayload) => {
  fetch(SLACK_WEBHOOK_URL, {
    method: "POST",
    body: JSON.stringify(message),
  });
};

export const process = functions.https.onRequest((req, res) => {
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

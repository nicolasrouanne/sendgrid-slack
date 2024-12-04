# Sendgrid Slack

Webhook 🔗 parsing _Sendgrid_ 📬 events and sending them as notifications 🚨 to _Slack_

<img width="556" alt="Screen Shot 2020-10-15 at 10 38 04" src="https://user-images.githubusercontent.com/12157019/96098548-89a2c900-0ed2-11eb-8d54-8cae76a1eded.png">

## Installation

You need to install [`node`](https://nodejs.org/) and `yarn`.
The project is made to be deployed to [**Firebase Cloud Functions**](https://firebase.google.com/docs/functions/); this requires using `firebase-tools`

```sh
yarn global add firebase-tools
```

To use `firebase-tools`, even in _development_, it is required to login

```
firebase login
```

You need to [**create a project**](https://firebase.google.com/docs/functions/get-started#create-a-firebase-project) on _Firebase_. When [initializing](https://firebase.google.com/docs/functions/get-started#initialize-your-project) Firebase function, select the project you just created.

```sh
firebase init functions
```

> choose "no" when asked to install dependencies with `npm`, as we are using `yarn` to manage dependencies here.

Install dependencies using `yarn`:

```sh
cd functions
yarn install
```

## Develop

> ⚠️ **All `yarn` commands must be run from `/functions` directory**

### Environment variables

The project requires some _environment variables_ to be set to run, even locally. These variables should be saved in `functions/.runtimeconfig.json`. If they are already populated in the `production` environment, the easier way to build `.runtimeconfig.json` is to [fetch the production environment variables](https://firebase.google.com/docs/functions/local-emulator#set_up_functions_configuration_optional).

```sh
firebase functions:config:get > .runtimeconfig.json
```

Otherwise, set this as the content of `functions/.runtimeconfig.json`:

```json
{
  "slack": {
    "channel": "#sendgrid",
    "token": "xoxb-.....-.....-......................"
  }
}
```

> [Get the token](https://slack.dev/node-slack-sdk/getting-started) from **OAuth & Permissions** section in your [_Slack Apps_](https://api.slack.com/apps) settings.

To set _environment variables_ in production use [`firebase functions:config:set`](https://firebase.google.com/docs/functions/config-env#set_environment_configuration_for_your_project).

```sh
 firebase functions:config:set slack.token=xoxb-.....-.....-......................
```

### Start

Run `yarn serve` to build and serve locally through _Firebase emulators_ 📡
Your function will be available at http://localhost:5001/sendgrid-slack/europe-west1/process ☕️

### Linting

The project is linted using [_TypeScript_](https://www.typescriptlang.org/) and [_Eslint_](https://eslint.org/).

Run the linter manually to check your changes if needed:

```sh
yarn lint
```

> **Deployment** 🚀 will run the linter and **fail the build** if any error is found. 👮‍♀️

### Styling

Code style 💅 is enforced by [_Prettier_](https://prettier.io/) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

We rely on **_Prettier_ default settings**, so no configuration file is needed/present.

Run `prettier` manually to format your files if needed:

```sh
yarn format
```

## Explore

To test the API, you can use the [Bruno](https://www.usebruno.com/) API client. Open the collection and environments in the `bruno` folder using the Bruno app and make your HTTP requests on your `local` or `production` environment.

![Bruno client](/docs/images/bruno.png)

## Ressources

### Slack messages

_Slack_ integration is made using the [node SDK](https://github.com/slackapi/node-slack-sdk), and especially [`@slack/web-api`](https://slack.dev/node-slack-sdk/web-api). Messages are built using [_Block Kit_](https://api.slack.com/block-kit/building).

This is what messages looks like:

<img width="634" alt="Screen Shot 2020-10-15 at 10 15 22" src="https://user-images.githubusercontent.com/12157019/96095820-6e828a00-0ecf-11eb-8fa3-2d7a117e997b.png">

### Slack

#### Configuration

In _Slack Apps_ > [_OAuth & Permissions_](https://api.slack.com/apps) > _Scopes_ add the following _Bot Token Scopes_:

- `chat:write`
- `incoming-webhook`

![Slack bot token scopes](/docs/images/slack-bot-token-scopes.png)

You then need to add the _Bot user_ to the channel you want to post messages to.

```
/invite @Sendgrid
```

### Sendgrid

#### Configuration

In _Sengrid Settings_ > [_Mail Settings_](https://app.sendgrid.com/settings/mail_settings), select the _Event webhook_ menu.
Select the events you want to be notified on and add the url of your _Firebase_ `production` webhook.

```
https://europe-west1-sendgrid-yourfirebaseprojectname.cloudfunctions.net/process
```

<img width="1675" alt="Screen Shot 2020-10-15 at 10 39 54" src="https://user-images.githubusercontent.com/12157019/96098769-ca9add80-0ed2-11eb-918f-4cb340242a4d.png">

#### Events

[Sengrid _events_](https://sendgrid.com/docs/for-developers/tracking-events/event/#events) look like this:

```json
[
  {
    "email": "example@test.com",
    "timestamp": 1513299569,
    "smtp-id": "<14c5d75ce93.dfd.64b469@ismtpd-555>",
    "event": "processed",
    "category": "cat facts",
    "sg_event_id": "sg_event_id",
    "sg_message_id": "sg_message_id"
  },
  {
    "email": "example@test.com",
    "timestamp": 1513299569,
    "smtp-id": "<14c5d75ce93.dfd.64b469@ismtpd-555>",
    "event": "deferred",
    "category": "cat facts",
    "sg_event_id": "sg_event_id",
    "sg_message_id": "sg_message_id",
    "response": "400 try again later",
    "attempt": "5"
  },
  {
    "email": "example@test.com",
    "timestamp": 1513299569,
    "smtp-id": "<14c5d75ce93.dfd.64b469@ismtpd-555>",
    "event": "delivered",
    "category": "cat facts",
    "sg_event_id": "sg_event_id",
    "sg_message_id": "sg_message_id",
    "response": "250 OK"
  },
  {
    "email": "example@test.com",
    "timestamp": 1513299569,
    "smtp-id": "<14c5d75ce93.dfd.64b469@ismtpd-555>",
    "event": "open",
    "category": "cat facts",
    "sg_event_id": "sg_event_id",
    "sg_message_id": "sg_message_id",
    "useragent": "Mozilla/4.0 (compatible; MSIE 6.1; Windows XP; .NET CLR 1.1.4322; .NET CLR 2.0.50727)",
    "ip": "255.255.255.255"
  },
  {
    "email": "example@test.com",
    "timestamp": 1513299569,
    "smtp-id": "<14c5d75ce93.dfd.64b469@ismtpd-555>",
    "event": "bounce",
    "category": "cat facts",
    "sg_event_id": "sg_event_id",
    "sg_message_id": "sg_message_id",
    "reason": "500 unknown recipient",
    "status": "5.0.0"
  },
  {
    "email": "example@test.com",
    "timestamp": 1513299569,
    "smtp-id": "<14c5d75ce93.dfd.64b469@ismtpd-555>",
    "event": "dropped",****
    "category": "cat facts",
    "sg_event_id": "sg_event_id",
    "sg_message_id": "sg_message_id",
    "reason": "Bounced Address",
    "status": "5.0.0"
  },
  {
    "email": "example@test.com",
    "timestamp": 1513299569,
    "smtp-id": "<14c5d75ce93.dfd.64b469@ismtpd-555>",
    "event": "spamreport",
    "category": "cat facts",
    "sg_event_id": "sg_event_id",
    "sg_message_id": "sg_message_id"
  }
]
```

We parse them and only use the most important fields at the moment; e.g. `email`, `event`, etc.

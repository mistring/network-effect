# Contributing

Participation is optional. Be curious, be helpful, and be kind. Read the code of conduct.

## Add yourself

Use the form on the site, or add `data/people/<your-username>.json`.

Use only values from `data/vocab.json`. The check fails closed on emails, phone numbers, extra fields, and lists that are too long.

| Field | How many | What it means |
|---|---|---|
| `interests` | 1–3 | What you want to talk about |
| `learning` | 1–2 | What you would like someone to teach you |
| `askMeAbout` | 1–3 | What you would be glad to help with |
| `industries` | 1–3 | Where you might want to apply those skills |
| `languages` | 0–5 | Optional. Languages you already use |

The filename has to match the `github` field, in lowercase.

## After the first pull request

The second contribution should include another person. Review their pull request, comment on their issue, or build something with them.

That interaction is the edge. The profile was only the node.

If you and someone else actually collaborated, you can later add an object to `data/edges.json`:

```json
{
  "from": "your-username",
  "to": "their-username",
  "context": "Reviewed pull request 17"
}
```

Do not invent edges for people who have only selected the same interest.

## Code changes

Fork the repo, make a branch, and open a pull request. A workflow validates profiles on every pull request. Michael merges.

Small pull requests are easier to talk about in class and easier to review afterward. That conversation is part of the project, not a delay in front of it.

## Security

Do not open a pull request that adds tokens, passwords, or personal contact details. If you find one, say so in an issue or email the maintainer and leave the data out of the ticket.

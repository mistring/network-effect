# Network Effect

> People are nodes. Relationships are edges.

Network Effect is an open-source experiment started with students in BYU CS 291 on October 2, 2026.

The question: **can we build a professional network by building something together?**

Adding yourself makes you a node. A collection of nodes is not much of a network. Connections happen when we interact: review a pull request, help with an issue, answer a question, or build a feature together.

You do not need to be looking for a job to take part.

## The site

[Network Effect](https://mistring.github.io/network-effect/) is the page for this experiment. It shows who has joined, what they want to learn, and who might be able to help.

Add yourself from [Join](https://mistring.github.io/network-effect/#join).

## Join

The first contribution requires no new code. It should take about two minutes. You do not fork the repository, and you do not open a pull request.

1. Fill in your name, GitHub username, and a few interests.
2. Choose **Add my profile**.
3. On the GitHub screen, choose **Submit new issue**. Sign in with the same username you typed.
4. The site adds your profile from that issue. Refresh to see it.

Or do it by hand:

1. Fork this repository.
2. Copy `data/people/template.json`.
3. Rename it to your GitHub username, lowercase: `data/people/yourusername.json`.
4. Fill it in. No email, phone number, or résumé.
5. Open a pull request.

A workflow saves the profile from the issue and rebuilds `data/people.json`. Editing the file yourself still goes through a pull request, below.

## What the site shows

- **People** — who has joined. These are nodes.
- **Possible introductions** — you want to learn something another person said to ask them about. These are reasons to talk, not relationships yet.
- **Actual connections** — recorded in `data/edges.json` only after people really interact.

## Want to code?

This project is unfinished on purpose. Look at the Issues tab.

- Improve the cards, layout, accessibility, or add a dark mode
- Filter by interest
- Draw the network as a graph
- Add a missing tag to `data/vocab.json`
- Implement the same counts or matching in Python, Java, Kotlin, Go, Rust, or something else
- Pitch an idea nobody has thought of

Before a second contribution, do something with someone else's work: review a pull request, answer a question, or help finish an issue.

## Run it locally

After the presentation, you can run this on your own computer in your own time. Use it to try a change to the site and see the result before you open a pull request.

```bash
python3 scripts/profiles.py validate
python3 scripts/profiles.py build
python3 -m http.server 8765
```

Then, open http://localhost:8765/

## Maintainer

Michael Stringham reviews and merges pull requests. Anyone can fork the repository and propose a change.

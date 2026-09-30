# Network Effect

> People are nodes. Relationships are edges.

Network Effect is an open-source experiment started with students in BYU CS 291 on October 2, 2026.

The question: **can we build a professional network by building something together?**

Adding yourself makes you a node. A collection of nodes is not much of a network. Connections happen when we interact: review a pull request, help with an issue, answer a question, or build a feature together.

You do not need to be looking for a job to take part.

## Join

The first contribution requires no new code. It should take about two minutes.

1. [Open the site and choose Join.](https://mistring.github.io/network-effect/#join)
2. Fill in your name, GitHub username, and a few interests.
3. Choose **Add my profile**.
4. GitHub will ask you to commit the file. If you do not have write access, that proposal becomes a pull request.

Or do it by hand:

1. Fork this repository.
2. Copy `data/people/template.json`.
3. Rename it to your GitHub username, lowercase: `data/people/yourusername.json`.
4. Fill it in. No email, phone number, or résumé.
5. Open a pull request.

After the pull request is merged, a workflow rebuilds `data/people.json` and the site updates.

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

```bash
python3 scripts/profiles.py validate
python3 scripts/profiles.py build
python3 -m http.server 8765
```

Open http://localhost:8765/

For the in-class refresh, the presenter uses `?live=1`. That reads profiles from the GitHub API as soon as they land on `main`, instead of waiting for GitHub Pages to rebuild. Everyone else can use the normal page.

## Maintainer

Michael Stringham reviews and merges pull requests. Anyone can fork the repository and propose a change.

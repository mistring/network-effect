# Issues to open before Friday

Create these on the public repo after it exists. Leave them open so students have somewhere to start. Suggested labels are in parentheses.

1. **Improve profile card styling** (`good first issue`, `design`)
   The cards work. Make them easier to scan on a phone and from the back of an auditorium.

2. **Add a dark mode** (`good first issue`)
   Respect `prefers-color-scheme`, with a toggle that sticks for the visit.

3. **Filter people by interest** (`good first issue`)
   Choosing "AI / ML" should hide everyone who did not select it.

4. **Improve mobile layout** (`good first issue`)
   Join should be completable with one thumb, without zooming.

5. **Improve accessibility** (`good first issue`, `help wanted`)
   Check focus order, contrast, and names for the choice chips.

6. **Add a missing interest or industry** (`good first issue`)
   Propose one new value in `data/vocab.json` and say who it helps. Do not add free-text tags one person at a time. The lists stay shared so matches still line up.

7. **Draw an interactive graph** (`help wanted`)
   People are nodes. Edges come from `data/edges.json`, not from shared interests. Shared interests can be a second, visually different kind of line if you label them as possible introductions.

8. **Show the most common interests on one screen** (`good first issue`)
   The Discover tab has a start. Make the "someone here can help" list easier to act on.

9. **Count the network in Python** (`help wanted`)
   Read `data/people.json`. Print how many people want to learn something another person listed under `askMeAbout`.

10. **Match learners and helpers in Java, Kotlin, Go, or Rust** (`help wanted`)
    Same input and the same idea as the Python issue. One language per pull request is plenty.

11. **Pitch your own idea** (`idea`)
    If the useful version of this project is something else, say so.

Do not assign these to students in advance. Let someone claim one by commenting.

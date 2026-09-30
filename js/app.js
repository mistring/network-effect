const state = {
  project: {
    owner: "mistring",
    repo: "network-effect",
    branch: "main",
    pagesUrl: "https://mistring.github.io/network-effect/"
  },
  vocab: null,
  people: [],
  edges: []
};

const $ = (id) => document.getElementById(id);

function text(value) {
  return value == null ? "" : String(value);
}

function el(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content != null) node.textContent = content;
  return node;
}

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
}

async function loadLivePeople(project) {
  const base = `https://api.github.com/repos/${project.owner}/${project.repo}/contents/data/people?ref=${project.branch}`;
  const listing = await getJson(base);
  const files = listing.filter((file) => file.type === "file" && file.name.endsWith(".json") && file.name !== "template.json");
  const people = await Promise.all(files.map((file) => getJson(file.download_url)));
  people.sort((a, b) => text(a.name).localeCompare(text(b.name)));
  return people;
}

async function load() {
  const live = new URLSearchParams(location.search).has("live");
  $("live-flag").hidden = !live;
  try {
    const [project, vocab, edges] = await Promise.all([
      getJson("data/project.json"),
      getJson("data/vocab.json"),
      getJson("data/edges.json").catch(() => [])
    ]);
    state.project = project;
    state.vocab = vocab;
    state.edges = Array.isArray(edges) ? edges : [];
    $("repo-link").href = `https://github.com/${project.owner}/${project.repo}`;
    if (live) {
      try {
        state.people = await loadLivePeople(project);
      } catch (error) {
        console.warn(error);
        state.people = await getJson(`data/people.json?t=${Date.now()}`);
        $("live-flag").textContent = "Live fetch failed; showing saved data";
      }
    } else {
      state.people = await getJson("data/people.json");
    }
    $("error").hidden = true;
  } catch (error) {
    $("error").hidden = false;
    $("error").textContent = "Could not read the network data. From the project folder, run: python3 -m http.server 8765";
    console.error(error);
  }
  renderStats();
  renderCards();
  renderDiscover();
  buildForm();
}

function helpMatches(people) {
  const helpers = new Map();
  people.forEach((person) => {
    (person.askMeAbout || []).forEach((topic) => {
      if (!helpers.has(topic)) helpers.set(topic, []);
      helpers.get(topic).push(person);
    });
  });
  const rows = [];
  const learners = new Set();
  people.forEach((person) => {
    (person.learning || []).forEach((topic) => {
      const matches = (helpers.get(topic) || []).filter((helper) => helper.github !== person.github);
      if (!matches.length) return;
      learners.add(person.github);
      matches.forEach((helper) => rows.push({ learner: person, helper, topic }));
    });
  });
  return { rows, learnerCount: learners.size };
}

function counts(people, field) {
  const tally = new Map();
  people.forEach((person) => {
    (person[field] || []).forEach((value) => {
      tally.set(value, (tally.get(value) || 0) + 1);
    });
  });
  return [...tally.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function renderStats() {
  const { rows, learnerCount } = helpMatches(state.people);
  $("stat-people").textContent = String(state.people.length);
  $("stat-potential").textContent = String(rows.length);
  $("stat-edges").textContent = String(state.edges.length);
  const people = state.people.length;
  if (people < 2) {
    $("stat-note").textContent = people
      ? "A profile is a node. Possible introductions show up when someone wants to learn what another person offered to talk about."
      : "Nobody is in the file yet.";
  } else {
    const noun = learnerCount === 1 ? "person wants" : "people want";
    $("stat-note").textContent = `${learnerCount} of ${people} ${noun} to learn something someone else here offered to talk about. Shared interests are a reason to start. They are not a connection yet.`;
  }
}

function renderCards() {
  const root = $("cards");
  root.replaceChildren();
  if (!state.people.length) {
    root.append(el("p", "section-copy", "No profiles yet."));
    return;
  }
  state.people.forEach((person) => {
    const card = el("article", "card");
    card.append(el("h3", null, person.name || person.github));
    const user = el("p", "user");
    const link = el("a", null, `@${person.github}`);
    link.href = `https://github.com/${person.github}`;
    user.append(link);
    card.append(user);
    appendList(card, "Interested in", person.interests);
    appendList(card, "Learning", person.learning);
    appendList(card, "Ask me about", person.askMeAbout);
    appendList(card, "Curious about", person.industries);
    root.append(card);
  });
}

function appendList(card, label, values) {
  if (!values || !values.length) return;
  card.append(el("h4", null, label));
  card.append(el("p", null, values.map((value) => value.replaceAll(" ", "\u00a0")).join(" · ")));
}

function renderBars(targetId, pairs) {
  const root = $(targetId);
  root.replaceChildren();
  if (!pairs.length) {
    root.append(el("p", "section-copy", "Nothing to count yet."));
    return;
  }
  const max = pairs[0][1];
  pairs.forEach(([label, count]) => {
    const row = el("div", "bar-row");
    row.append(el("span", null, label));
    const track = el("div", "bar-track");
    const fill = el("div", "bar-fill");
    fill.style.width = `${Math.max(8, Math.round((count / max) * 100))}%`;
    track.append(fill);
    track.setAttribute("role", "img");
    track.setAttribute("aria-label", `${label}: ${count}`);
    row.append(track);
    row.append(el("span", null, String(count)));
    root.append(row);
  });
}

function renderDiscover() {
  const { rows, learnerCount } = helpMatches(state.people);
  const summary = $("help-summary");
  const list = $("matches");
  list.replaceChildren();
  if (!rows.length) {
    summary.textContent = "No matches yet. A match appears when one person wants to learn what another person said to ask them about.";
  } else {
    summary.textContent = `${learnerCount} ${learnerCount === 1 ? "person has" : "people have"} someone in this network who offered to talk about a thing they want to learn.`;
    rows.slice(0, 8).forEach((row) => {
      const item = el("li");
      item.append(el("strong", null, row.learner.name || row.learner.github));
      item.append(document.createTextNode(" wants to learn "));
      item.append(el("strong", null, row.topic));
      item.append(document.createTextNode(". "));
      item.append(el("strong", null, row.helper.name || row.helper.github));
      item.append(document.createTextNode(" said ask me about it."));
      list.append(item);
    });
  }
  renderBars("interest-bars", counts(state.people, "interests"));
  renderBars("industry-bars", counts(state.people, "industries"));
}

function choiceBox(name, value) {
  const label = el("label");
  const input = document.createElement("input");
  input.type = "checkbox";
  input.name = name;
  input.value = value;
  label.append(input, document.createTextNode(value));
  return label;
}

function fillSelect(select, values) {
  select.replaceChildren(el("option", null, "Choose one"));
  select.firstChild.value = "";
  values.forEach((value) => {
    const option = el("option", null, value);
    option.value = value;
    select.append(option);
  });
}

function selectedInterests() {
  return [...document.querySelectorAll("#interests input:checked")].map((input) => input.value);
}

function profileFromForm() {
  const github = $("github").value.trim().toLowerCase();
  const profile = {
    github,
    name: $("name").value.trim(),
    interests: selectedInterests(),
    learning: [$("learning").value].filter(Boolean),
    askMeAbout: [$("ask").value].filter(Boolean),
    industries: [$("industry").value].filter(Boolean)
  };
  return profile;
}

function proposeUrl(profile) {
  const { owner, repo, branch } = state.project;
  const filename = `${profile.github}.json`;
  const value = JSON.stringify(profile, null, 2) + "\n";
  const query = [
    `filename=${encodeURIComponent(filename)}`,
    `value=${encodeURIComponent(value)}`,
    `message=${encodeURIComponent(`Add ${profile.github} to the network`)}`
  ].join("&");
  return `https://github.com/${owner}/${repo}/new/${branch}/data/people?${query}`;
}

function refreshPreview() {
  const profile = profileFromForm();
  const name = profile.github || "username";
  $("filename").textContent = `data/people/${name}.json`;
  $("preview").textContent = JSON.stringify(profile, null, 2);
  const ready = profile.github && profile.name && profile.interests.length >= 1
    && profile.learning.length && profile.askMeAbout.length && profile.industries.length;
  $("submit").disabled = !ready;
}

function buildForm() {
  if (!state.vocab || $("interests").childElementCount) return;
  state.vocab.interests.forEach((value) => $("interests").append(choiceBox("interests", value)));
  fillSelect($("learning"), state.vocab.topics);
  fillSelect($("ask"), state.vocab.topics);
  fillSelect($("industry"), state.vocab.industries);
  document.querySelectorAll("#interests input").forEach((input) => {
    input.addEventListener("change", () => {
      const checked = selectedInterests();
      if (checked.length > 3) {
        input.checked = false;
        $("form-error").hidden = false;
        $("form-error").textContent = "Pick up to 3 interests.";
        refreshPreview();
        return;
      }
      $("form-error").hidden = true;
      refreshPreview();
    });
  });
  ["name", "github", "learning", "ask", "industry"].forEach((id) => {
    $(id).addEventListener("input", () => {
      if (id === "github") $(id).value = $(id).value.toLowerCase();
      refreshPreview();
    });
    $(id).addEventListener("change", refreshPreview);
  });
  $("join-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const profile = profileFromForm();
    if (profile.interests.length < 1 || profile.interests.length > 3) {
      $("form-error").hidden = false;
      $("form-error").textContent = "Pick 1 to 3 interests.";
      return;
    }
    window.location.href = proposeUrl(profile);
  });
  refreshPreview();
}

function showTab(name) {
  document.querySelectorAll("[data-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.panel !== name;
  });
  document.querySelectorAll("[data-tab]").forEach((tab) => {
    if (tab.dataset.tab === name) tab.setAttribute("aria-current", "page");
    else tab.removeAttribute("aria-current");
  });
}

function tabFromHash() {
  const name = location.hash.replace("#", "");
  return ["network", "discover", "join"].includes(name) ? name : "network";
}

window.addEventListener("hashchange", () => showTab(tabFromHash()));

load().then(() => showTab(tabFromHash()));

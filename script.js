let eventData = [];
let teamData = [];

const eventAPI = "https://opensheet.elk.sh/1G0kQL9J3e8Wn3CxjJEQr91dOfWscOoGFAGF1GvYgbxE/Sheet1";
const teamAPI = "https://opensheet.elk.sh/1G0kQL9J3e8Wn3CxjJEQr91dOfWscOoGFAGF1GvYgbxE/Team";

// Normalize helper
function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function getNameValue(item) {
  const knownValue =
    item.Name ||
    item["Name "] ||
    item.name ||
    item.NAME ||
    item["Full Name"] ||
    item["Member Name"];

  if (String(knownValue || "").trim()) {
    return String(knownValue).trim();
  }

  const nameLikeKey = Object.keys(item).find((key) => {
    const normalizedKey = normalize(key).replace(/\s+/g, " ");
    return normalizedKey === "name" || normalizedKey.includes("name");
  });

  return nameLikeKey ? String(item[nameLikeKey] || "").trim() : "";
}

function getYearValue(item) {
  const knownValue =
    item.Year ||
    item.year ||
    item.YEAR ||
    item["Academic Year"] ||
    item.Batch ||
    item.Class ||
    item["Study Year"];

  if (String(knownValue || "").trim()) {
    return String(knownValue).trim();
  }

  // Fallback for unexpected header variants like "Year ", "academic year", etc.
  const yearLikeKey = Object.keys(item).find((key) => {
    const normalizedKey = normalize(key).replace(/\s+/g, " ");
    return normalizedKey === "year" || normalizedKey.includes("year");
  });

  return yearLikeKey ? String(item[yearLikeKey] || "").trim() : "";
}

function getFilteredEventRows() {
  const selectedYear = normalize(document.getElementById("year").value);
  const selectedEvent = normalize(document.getElementById("event").value);

  return eventData.filter((item) => {
    const year = normalize(getYearValue(item));
    const event = normalize(item.Event);
    const yearMatch = !selectedYear || year === selectedYear;
    const eventMatch = !selectedEvent || event === selectedEvent;
    return yearMatch && eventMatch;
  });
}

function applyCustomEventOrder(events) {
  const customOrder = [
    "Introduction to Microsoft Azure",
    "Introduction to GitHub",
    "Build & Deploy with VSC & GitHub",
    ".NET Conf 2024 Amravati",
    ".NET Conf 2025 Amravati",
    "Copilot Dev Days",
    "Microsoft Explore AI",
    "Global AI Bootcamp Amravati"
  ];

  const sortedEvents = customOrder.filter((e) => events.includes(e));
  const remainingEvents = events.filter((e) => !customOrder.includes(e));
  return [...sortedEvents, ...remainingEvents];
}

function populateYearDropdown() {
  const yearSelect = document.getElementById("year");
  const years = [...new Set(eventData.map((item) => getYearValue(item)).filter(Boolean))]
    .sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" }));

  yearSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select Year";
  yearSelect.appendChild(defaultOption);

  years.forEach((year) => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  });
}

function populateEventDropdown() {
  const eventSelect = document.getElementById("event");
  const selectedYear = normalize(document.getElementById("year").value);

  const uniqueEvents = [
    ...new Set(
      eventData
        .filter((item) => !selectedYear || normalize(getYearValue(item)) === selectedYear)
        .map((item) => item.Event)
        .filter(Boolean)
    )
  ];

  const finalEvents = applyCustomEventOrder(uniqueEvents);
  eventSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select Event";
  eventSelect.appendChild(defaultOption);

  finalEvents.forEach((eventName) => {
    const option = document.createElement("option");
    option.value = eventName;
    option.textContent = eventName;
    eventSelect.appendChild(option);
  });
}

function populateTeamYearDropdown() {
  const teamYearSelect = document.getElementById("teamYear");
  const years = [...new Set(teamData.map((item) => getYearValue(item)).filter(Boolean))]
    .sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" }));

  teamYearSelect.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select Team Year";
  teamYearSelect.appendChild(defaultOption);

  years.forEach((year) => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    teamYearSelect.appendChild(option);
  });
}

// 🚀 Load Data + Custom Event Order
async function loadData() {
  eventData = await fetch(eventAPI).then((r) => r.json());
  teamData = await fetch(teamAPI).then((r) => r.json());

  populateYearDropdown();
  populateEventDropdown();
  populateTeamYearDropdown();
}

loadData();

// ✅ Verify
function verify() {
  let type = document.getElementById("type").value;
  let result = document.getElementById("result");
  let matchedRecord = null;

  if (type === "event") {
    const inputYear = document.getElementById("year").value.trim();
    const inputEvent = document.getElementById("event").value.trim();
    const inputName = document.getElementById("eventName").value.trim();

    let year = normalize(inputYear);
    let event = normalize(inputEvent);
    let name = normalize(inputName);

    matchedRecord = eventData.find((e) =>
      normalize(getYearValue(e)) === year &&
      normalize(e.Event) === event &&
      normalize(getNameValue(e)) === name
    );
  } else {
    const selectedTeamYear = normalize(document.getElementById("teamYear").value);
    let name = normalize(document.getElementById("teamName").value);

    matchedRecord = teamData.find((e) =>
      normalize(getYearValue(e)) === selectedTeamYear &&
      normalize(getNameValue(e)) === name
    );
  }

  result.className = matchedRecord ? "success" : "error";

  result.innerHTML = matchedRecord
    ? (type === "event"
        ? `✅ ${document.getElementById("eventName").value.trim()} participated in the event ${document.getElementById("event").value.trim()}.`
      : `✅ ${document.getElementById("teamName").value.trim()} is verified in ${document.getElementById("teamYear").value.trim()} as ${matchedRecord.Domain || "Team Member"}.`)
    : "❌ Record not found. Please contact admin.";
}

// 🔐 Decrypt Effect
function scramble(el, text) {
  const chars = "0123456789@#$%&*";
  let iteration = 0;

  const interval = setInterval(() => {
    el.innerText = text
      .split("")
      .map((c, i) =>
        i < iteration ? text[i] : chars[Math.floor(Math.random() * chars.length)]
      )
      .join("");

    iteration += 0.5;

    if (iteration >= text.length) {
      clearInterval(interval);
      el.innerText = text;
    }
  }, 35);
}

document.querySelectorAll(".decrypt").forEach((link) => {
  const text = link.innerText;
  link.addEventListener("mouseenter", () => scramble(link, text));
});

// 🔍 Suggestion Renderer
function renderSuggestions(list, boxId, inputId) {
  const box = document.getElementById(boxId);
  box.innerHTML = "";

  list.slice(0, 6).forEach((item) => {
    const div = document.createElement("div");
    div.textContent = getNameValue(item);

    div.addEventListener("click", () => {
      document.getElementById(inputId).value = getNameValue(item);
      box.innerHTML = "";
    });

    box.appendChild(div);
  });
}

// 🔍 Event Suggestions
document.getElementById("eventName").addEventListener("input", function () {
  const value = normalize(this.value);
  const selectedYear = normalize(document.getElementById("year").value);
  const selectedEvent = normalize(document.getElementById("event").value);

  if (!value) {
    document.getElementById("suggestions").innerHTML = "";
    return;
  }

  const filtered = eventData.filter((item) => {
    const sameYear = !selectedYear || normalize(getYearValue(item)) === selectedYear;
    const sameEvent = !selectedEvent || normalize(item.Event) === selectedEvent;
    return sameYear && sameEvent && normalize(getNameValue(item)).includes(value);
  });

  renderSuggestions(filtered, "suggestions", "eventName");
});

document.getElementById("year").addEventListener("change", () => {
  populateEventDropdown();
  document.getElementById("eventName").value = "";
  document.getElementById("suggestions").innerHTML = "";
  document.getElementById("result").innerHTML = "";
  document.getElementById("result").className = "";
});

document.getElementById("event").addEventListener("change", () => {
  document.getElementById("eventName").value = "";
  document.getElementById("suggestions").innerHTML = "";
});

// 🔍 Team Suggestions
document.getElementById("teamName").addEventListener("input", function () {
  const value = normalize(this.value);
  const selectedTeamYear = normalize(document.getElementById("teamYear").value);

  if (!value) {
    document.getElementById("teamSuggestions").innerHTML = "";
    return;
  }

  const filtered = teamData.filter((item) =>
    (!selectedTeamYear || normalize(getYearValue(item)) === selectedTeamYear) &&
    normalize(getNameValue(item)).includes(value)
  );

  renderSuggestions(filtered, "teamSuggestions", "teamName");
});

document.getElementById("teamYear").addEventListener("change", () => {
  document.getElementById("teamName").value = "";
  document.getElementById("teamSuggestions").innerHTML = "";
  document.getElementById("result").innerHTML = "";
  document.getElementById("result").className = "";
});

// 🔄 Switch UI
document.getElementById("type").addEventListener("change", function () {
  const isEvent = this.value === "event";

  document.getElementById("eventBox").style.display = isEvent ? "block" : "none";
  document.getElementById("teamBox").style.display = isEvent ? "none" : "block";

  document.getElementById("result").innerHTML = "";
  document.getElementById("result").className = "";

  document.getElementById("suggestions").innerHTML = "";
  document.getElementById("teamSuggestions").innerHTML = "";

  if (isEvent) {
    document.getElementById("year").value = "";
    populateEventDropdown();
    document.getElementById("eventName").value = "";
  } else {
    document.getElementById("teamYear").value = "";
    document.getElementById("teamName").value = "";
  }
});

// 🧼 Close suggestions when clicking outside
document.addEventListener("click", (event) => {
  if (!event.target.closest("#eventBox") && !event.target.closest("#teamBox")) {
    document.getElementById("suggestions").innerHTML = "";
    document.getElementById("teamSuggestions").innerHTML = "";
  }
});

// 🍔 Mobile Menu
function toggleMenu() {
  const mobileMenu = document.getElementById("mobileMenu");
  const hamburger = document.querySelector(".hamburger");

  const isOpen = mobileMenu.classList.toggle("open");

  hamburger.classList.toggle("active", isOpen);
  hamburger.setAttribute("aria-expanded", String(isOpen));
}

// Close mobile menu on link click
document.querySelectorAll("#mobileMenu .nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.getElementById("mobileMenu").classList.remove("open");
    document.querySelector(".hamburger").classList.remove("active");
  });
});
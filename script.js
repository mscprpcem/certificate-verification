let eventData = [];
let teamData = [];

const eventAPI = "https://opensheet.elk.sh/1G0kQL9J3e8Wn3CxjJEQr91dOfWscOoGFAGF1GvYgbxE/Sheet1";
const teamAPI = "https://opensheet.elk.sh/1G0kQL9J3e8Wn3CxjJEQr91dOfWscOoGFAGF1GvYgbxE/Team";

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

// Load data
async function loadData() {
  eventData = await fetch(eventAPI).then((r) => r.json());
  teamData = await fetch(teamAPI).then((r) => r.json());

  const eventSelect = document.getElementById("event");
  const events = [...new Set(eventData.map((e) => e.Event).filter(Boolean))];
  eventSelect.innerHTML = "";

  events.forEach((e) => {
    let option = document.createElement("option");
    option.textContent = e;
    eventSelect.appendChild(option);
  });
}

loadData();

// Verify
function verify() {
  let type = document.getElementById("type").value;
  let result = document.getElementById("result");
  let matchedRecord = null;

  if (type === "event") {
    const inputEvent = document.getElementById("event").value.trim();
    const inputName = document.getElementById("eventName").value.trim();
    let event = normalize(inputEvent);
    let name = normalize(inputName);

    matchedRecord = eventData.find((e) =>
      normalize(e.Event) === event &&
      normalize(e.Name) === name
    );
  } else {
    let name = normalize(document.getElementById("teamName").value);

    matchedRecord = teamData.find((e) =>
      normalize(e.Name) === name
    );
  }

  result.className = matchedRecord ? "success" : "error";
  result.innerHTML = matchedRecord
    ? (type === "event"
      ? `✅ ${document.getElementById("eventName").value.trim()} participated in the event ${document.getElementById("event").value.trim()}.`
      : `✅ ${document.getElementById("teamName").value.trim()} is a verified team member.`)
    : "❌ Record not found. Please contact admin.";
}

// Decrypt effect
function scramble(el, text) {
  const chars = "0123456789@#$%&*";
  let iteration = 0;

  const interval = setInterval(() => {
    el.innerText = text
      .split("")
      .map((c, i) => i < iteration ? text[i] : chars[Math.floor(Math.random()*chars.length)])
      .join("");

    iteration += 0.5;

    if (iteration >= text.length) {
      clearInterval(interval);
      el.innerText = text;
    }
  }, 35);
}

document.querySelectorAll(".decrypt").forEach(link => {
  const text = link.innerText;
  link.addEventListener("mouseenter", () => scramble(link, text));
});

function renderSuggestions(list, boxId, inputId) {
  const box = document.getElementById(boxId);
  box.innerHTML = "";

  list.slice(0, 6).forEach((item) => {
    const div = document.createElement("div");
    div.textContent = item.Name;
    div.addEventListener("click", () => {
      document.getElementById(inputId).value = item.Name;
      box.innerHTML = "";
    });
    box.appendChild(div);
  });
}

document.getElementById("eventName").addEventListener("input", function () {
  const value = normalize(this.value);
  const selectedEvent = normalize(document.getElementById("event").value);
  const suggestionsBox = document.getElementById("suggestions");

  if (!value) {
    suggestionsBox.innerHTML = "";
    return;
  }

  const filtered = eventData.filter((item) => {
    const sameEvent = !selectedEvent || normalize(item.Event) === selectedEvent;
    return sameEvent && normalize(item.Name).includes(value);
  });

  renderSuggestions(filtered, "suggestions", "eventName");
});

document.getElementById("teamName").addEventListener("input", function () {
  const value = normalize(this.value);
  const suggestionsBox = document.getElementById("teamSuggestions");

  if (!value) {
    suggestionsBox.innerHTML = "";
    return;
  }

  const filtered = teamData.filter((item) => normalize(item.Name).includes(value));
  renderSuggestions(filtered, "teamSuggestions", "teamName");
});

document.getElementById("type").addEventListener("change", function () {
  const isEvent = this.value === "event";
  document.getElementById("eventBox").style.display = isEvent ? "block" : "none";
  document.getElementById("teamBox").style.display = isEvent ? "none" : "block";
  document.getElementById("result").className = "";
  document.getElementById("result").textContent = "";
  document.getElementById("suggestions").innerHTML = "";
  document.getElementById("teamSuggestions").innerHTML = "";
});

document.addEventListener("click", (event) => {
  if (!event.target.closest("#eventBox") && !event.target.closest("#teamBox")) {
    document.getElementById("suggestions").innerHTML = "";
    document.getElementById("teamSuggestions").innerHTML = "";
  }
});

function toggleMenu() {
  const mobileMenu = document.getElementById("mobileMenu");
  const hamburger = document.querySelector(".hamburger");
  if (!mobileMenu) {
    return;
  }

  const isOpen = mobileMenu.classList.toggle("open");
  if (hamburger) {
    hamburger.classList.toggle("active", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
  }
}

document.querySelectorAll("#mobileMenu .nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    const mobileMenu = document.getElementById("mobileMenu");
    const hamburger = document.querySelector(".hamburger");
    if (mobileMenu) {
      mobileMenu.classList.remove("open");
    }
    if (hamburger) {
      hamburger.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
    }
  });
});

document.addEventListener("click", (event) => {
  const mobileMenu = document.getElementById("mobileMenu");
  const hamburger = document.querySelector(".hamburger");
  if (!mobileMenu || !hamburger) {
    return;
  }

  const clickedInsideMenu = event.target.closest("#mobileMenu");
  const clickedHamburger = event.target.closest(".hamburger");
  if (!clickedInsideMenu && !clickedHamburger) {
    mobileMenu.classList.remove("open");
    hamburger.classList.remove("active");
    hamburger.setAttribute("aria-expanded", "false");
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 992) {
    const mobileMenu = document.getElementById("mobileMenu");
    const hamburger = document.querySelector(".hamburger");
    if (mobileMenu) {
      mobileMenu.classList.remove("open");
    }
    if (hamburger) {
      hamburger.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
    }
  }
});
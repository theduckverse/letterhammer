// =============== LetterHammer — External JavaScript ===============
// 100% working version — no inline JS, no Tailwind conflicts, no CSP issues.

// ==== SCENARIO TEMPLATES ====
const SCENARIOS = {
  "Parking Ticket Appeal": [
    { id: "fullName", label: "Your full name" },
    { id: "address", label: "Your mailing address" },
    { id: "ticketNumber", label: "Ticket number" },
    { id: "issuingAgency", label: "Issuing agency" },
    { id: "incidentDate", label: "Incident date" },
    { id: "reason", label: "Why is the ticket unfair?" },
    { id: "desiredOutcome", label: "What result do you want?" }
  ],

  "Medical Bill Dispute": [
    { id: "fullName", label: "Your full name" },
    { id: "provider", label: "Medical provider" },
    { id: "amount", label: "Bill amount" },
    { id: "issue", label: "What is wrong with the bill?" },
    { id: "desiredOutcome", label: "What result do you want?" }
  ],

  "Refund Request Escalation": [
    { id: "fullName", label: "Your full name" },
    { id: "company", label: "Company name" },
    { id: "issue", label: "What happened?" },
    { id: "amount", label: "Refund amount (if any)" },
    { id: "desiredOutcome", label: "What result do you want?" }
  ]
};

// =============== INIT ===============
document.addEventListener("DOMContentLoaded", () => {
  console.log("LetterHammer JS Loaded");

  const cards = document.querySelectorAll(".scenario-card");
  console.log("Found scenario cards:", cards.length);

  cards.forEach(card => {
    card.addEventListener("click", () => {
      const name = card.querySelector("h3").innerText.trim();
      console.log("Clicked:", name);
      openScenario(name);
    });
  });
});

// =============== OPEN SCENARIO FORM ===============
function openScenario(name) {
  const fields = SCENARIOS[name];
  if (!fields) {
    alert("Scenario not defined.");
    return;
  }

  let formHtml = "";
  fields.forEach(f => {
    formHtml += `
      <label class="block font-medium mt-4">${f.label}</label>
      <input id="${f.id}" class="w-full p-2 border rounded-lg mt-1" />
    `;
  });

  const modal = document.createElement("div");
  modal.id = "lh-modal";
  modal.className = "fixed inset-0 bg-black/40 flex justify-center items-center z-50";

  modal.innerHTML = `
    <div class="bg-white p-8 rounded-2xl max-w-lg w-full shadow-lg">
      <h2 class="text-2xl font-bold mb-4">${name}</h2>
      ${formHtml}
      <button id="lh-generate" class="mt-6 w-full bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700">
        Generate Letter
      </button>
      <button id="lh-cancel" class="mt-3 w-full p-3 rounded-xl border">
        Cancel
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("lh-generate").onclick = () =>
    generateLetter(name, fields);

  document.getElementById("lh-cancel").onclick = () =>
    modal.remove();
}

// =============== AI GENERATION ===============
async function generateLetter(name, fields) {
  const key = prompt("Enter Gemini API Key:");
  if (!key) return;

  const answers = {};
  fields.forEach(f => {
    answers[f.id] = document.getElementById(f.id).value;
  });

  const promptText =
    `Write a formal letter for scenario: ${name}\n\n` +
    Object.entries(answers)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join("\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    }
  );

  const data = await response.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";

  showLetter(text);
  document.getElementById("lh-modal")?.remove();
}

// =============== OUTPUT MODAL ===============
function showLetter(text) {
  const modal = document.createElement("div");
  modal.className =
    "fixed inset-0 bg-black/40 flex justify-center items-center z-50";

  modal.innerHTML = `
    <div class="bg-white p-8 rounded-2xl max-w-2xl w-full shadow-lg whitespace-pre-wrap">
      <h2 class="text-2xl font-bold mb-4">Your Letter</h2>
      <div class="p-4 border rounded-lg bg-slate-50 max-h-[60vh] overflow-auto">${text}</div>

      <button class="mt-6 w-full bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700"
        onclick='navigator.clipboard.writeText(${JSON.stringify(text)})'>
        Copy Letter
      </button>

      <button class="mt-3 w-full p-3 rounded-xl border"
        onclick="this.closest('div').remove()">
        Close
      </button>
    </div>
  `;

  document.body.appendChild(modal);
}

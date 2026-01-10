let lastChoice = null; // Tracks last player choice ("safe" or "risky")
let trustLevel = 50;
let mapCaptainShown = false;

// ===========================
// 🎵 Background Music (BGM)
// ===========================
const bgm = document.getElementById("bgm");

if (bgm) {
  bgm.volume = 0.35;
  bgm.loop = true;
  bgm.preload = "auto";

  // Try autoplay muted (allowed by browser)
  bgm.muted = true;
  bgm.play().catch(() => {});
}

// Unmute + play on first user interaction
function unlockBgm() {
  if (!bgm) return;
  bgm.muted = false;
  bgm.play().catch(() => {});
}

document.addEventListener("click", unlockBgm, { once: true });
document.addEventListener("touchstart", unlockBgm, { once: true });

let mapNpcChar = 0;
let mapNpcTypingInterval = null;

// CURSOR
const gameContainer = document.getElementById("game-container");

function cursorDown() {
  gameContainer.classList.add("cursor-down");
}
function cursorUp() {
  gameContainer.classList.remove("cursor-down");
}

document.addEventListener("mousedown", cursorDown);
document.addEventListener("mouseup", cursorUp);

// for mobile
document.addEventListener("touchstart", cursorDown, { passive: true });
document.addEventListener("touchend", cursorUp);

const trustFill = document.getElementById("trust-fill");
const introScreen = document.getElementById("intro-screen");

const trustBar = document.getElementById("trust-bar");
trustBar.style.display = "none";

const npcScreen = document.getElementById("npc-screen");
const npcVideo = document.getElementById("npc-video");
const npcTextEl = document.getElementById("npc-text");
const npcNextBtn = document.getElementById("npc-next-btn");

npcVideo.addEventListener("error", () => {
  console.log("❌ NPC video error:", npcVideo.error);
});

npcVideo.addEventListener("loadeddata", () => {
  console.log("✅ NPC video loaded and has data");
});

let currentMapStage = 0;
// 0 = before Part 1
// 1 = after Part 1
// 2 = after Part 2
// 3 = after Part 3

const mapCaptainLines = [
  "Ahoy! Start yer journey here — click Checkpoint 1 to begin the Online Grooming scenario.",
  "Well done, sailor! Next up — head to Checkpoint 2 to uncover the dangers of Impersonation.",
  "Ye’re doing great! Now steer toward Checkpoint 3 to learn about Image Abuse.",
  "All trials complete! Sail to the Treasure to claim what ye’ve learned."
];

function setChatBackground(src) {
  // only change if different (prevents flicker)
  if (chatBgVideo.getAttribute("src") !== src) {
    chatBgVideo.src = src;
    chatBgVideo.load();
  }

  chatBgVideo.currentTime = 0;

  // try to play (autoplay policies: usually OK because user clicked checkpoint)
  chatBgVideo.play().catch(() => {});
}

// Intro pirate ship video
const introVideo = document.getElementById("intro-video");
introVideo.src = "pirate-ship-video.mp4"; // <-- replace with your actual MP4 file path
introVideo.load();

// Underwater pirate ship video
const chatBgVideo = document.getElementById("chat-bg-video");
chatBgVideo.load();

// Pirate table video
const mapBgVideo = document.getElementById("map-bg-video");
mapBgVideo.src = "pirate-table-video.mp4";
mapBgVideo.load();

const q1Screen = document.getElementById("q1-screen");

const startBtn = document.getElementById("start-btn");
const q1RiskyBtn = document.getElementById("q1-risky");
const q1SafeBtn = document.getElementById("q1-safe");
const choicesDiv = document.querySelector(".choices");

function updateTrustMeter() {
  trustFill.style.width = trustLevel + "%";
  const label = document.getElementById("trust-label");

  if (trustLevel > 70) {
    trustFill.style.background = "#4caf50";
    label.textContent = "Phew! You're Safe.";
  } else if (trustLevel > 30) {
    trustFill.style.background = "#f5c542";
    label.textContent = "Caution! You're at moderate risk.";
  } else {
    trustFill.style.background = "#e53935";
    label.textContent = "Danger Zone! Your safety is at risk.";
  }
}

function changeTrust(amount) {
  trustLevel += amount;
  trustLevel = Math.max(0, Math.min(100, trustLevel));
  updateTrustMeter();
}

// Intro typewriter/fade in animation
const typewriterText = "Welcome to SafeQuest";
const typewriterEl = document.getElementById("typewriter");

let charIndex = 0;

function startTypewriter() {
  if (!typewriterEl) return;

  const typingInterval = setInterval(() => {
    typewriterEl.textContent += typewriterText.charAt(charIndex);
    charIndex++;

    if (charIndex === typewriterText.length) {
      clearInterval(typingInterval);

      // Fade in intro paragraph
      const introParagraph = document.querySelector(".intro-paragraph");
      if (introParagraph) {
        setTimeout(() => {
          introParagraph.classList.add("show");

          // Fade in "Happy playing!"
          const happyPlaying = document.querySelector(".happy-playing");
          if (happyPlaying) {
            setTimeout(() => {
              happyPlaying.classList.add("show");

              // ✅ Slide in Start Game button AFTER happy playing
              const startBtn = document.getElementById("start-btn");
              if (startBtn) {
                setTimeout(() => {
                  startBtn.classList.add("show");
                }, 400);
              }

            }, 600);
          }

        }, 300);
      }
    }
  }, 40); // typing speed
}

// Treasure screen typewriter animation
function startTreasureTypewriter(onDone) {
  const container = document.getElementById("treasure-typewriter");
  if (!container) return;

  const line1 = container.querySelector(".line-1");
  const line2 = container.querySelector(".line-2");

  const text1 = "Voyage Complete";
  const text2 = "🥇 SafeQuest Secured 🥇";

  let i = 0;
  let j = 0;

  line1.textContent = "";
  line2.textContent = "";
  

  const interval = setInterval(() => {
    if (i < text1.length) {
      line1.textContent += text1.charAt(i++);
    } else if (j < text2.length) {
      line2.textContent += text2.charAt(j++);
    } else {
      clearInterval(interval);
      if (typeof onDone === "function") onDone();
    }
  }, 45);
}

// MAP npc typewriter animation
function startMapNpcTypewriter(text) {
  const textEl = document.getElementById("map-npc-text");
  const nextBtn = document.getElementById("map-npc-next-btn"); // ✅ FIXED ID

  if (!textEl || !nextBtn) {
    console.log("Map NPC typewriter missing elements:", { textEl, nextBtn });
    return;
  }

  textEl.textContent = "";
  mapNpcChar = 0;

  nextBtn.style.opacity = "0";
  nextBtn.style.pointerEvents = "none";

  if (mapNpcTypingInterval) clearInterval(mapNpcTypingInterval);

  mapNpcTypingInterval = setInterval(() => {
    textEl.textContent += text.charAt(mapNpcChar);
    mapNpcChar++;

    if (mapNpcChar >= text.length) {
      clearInterval(mapNpcTypingInterval);
      mapNpcTypingInterval = null;

      nextBtn.style.opacity = "1";
      nextBtn.style.pointerEvents = "auto";
    }
  }, 25);
}

// Player/stranger message bubble animation (PART 1)
function addPlayerMessage(message) {
  const container = document.querySelector(".chat-container");
  const bubble = document.createElement("div");
  bubble.classList.add("chat-bubble", "player");
  bubble.textContent = message;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function addStrangerMessage(message, delay = 1000, callback = null) {
  const container = document.querySelector(".chat-container");

  const typing = document.createElement("div");
  typing.classList.add("typing");
  typing.textContent = "Typing...";
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;

  setTimeout(() => {
    typing.remove();
    const bubble = document.createElement("div");
    bubble.classList.add("chat-bubble", "stranger");
    // Replace newlines with <br> so they show as line breaks
    bubble.innerHTML = message.replace(/\n/g, "<br>");
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
    if (callback) callback(); // run callback after stranger message
  }, delay);
}

// Player/stranger message bubble animation (PART 2)
function addPart2PlayerMessage(message) {
  const container = document.querySelector(".chat-container");
  const bubble = document.createElement("div");
  bubble.classList.add("chat-bubble", "player");
  bubble.textContent = message;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function addPart2StrangerMessage(message, delay = 1000, callback = null) {
  const container = document.querySelector(".chat-container");

  const typing = document.createElement("div");
  typing.classList.add("typing");
  typing.textContent = "Typing...";
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;

  setTimeout(() => {
    typing.remove();
    const bubble = document.createElement("div");
    bubble.classList.add("chat-bubble", "stranger");
    // Replace newlines with <br> so they show as line breaks
    bubble.innerHTML = message.replace(/\n/g, "<br>");
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
    if (callback) callback(); // run callback after stranger message
  }, delay);
}

// Player/stranger message bubble animation (PART 3)
function addPart3PlayerMessage(message) {
  const container = document.querySelector(".chat-container");
  const bubble = document.createElement("div");
  bubble.classList.add("chat-bubble", "player");
  bubble.textContent = message;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
}

function addPart3StrangerMessage(message, delay = 1000, callback = null) {
  const container = document.querySelector(".chat-container");

  const typing = document.createElement("div");
  typing.classList.add("typing");
  typing.textContent = "Typing...";
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;

  setTimeout(() => {
    typing.remove();
    const bubble = document.createElement("div");
    bubble.classList.add("chat-bubble", "stranger");
    bubble.innerHTML = message.replace(/\n/g, "<br>");
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
    if (callback) callback();
  }, delay);
}

function disableChoices() {
  Array.from(choicesDiv.children).forEach(btn => {
    btn.disabled = true;
    btn.style.opacity = 0.6;
  });
}

function enableChoices() {
  Array.from(choicesDiv.children).forEach(btn => {
    btn.disabled = false;
    btn.style.opacity = 1;
  });
}

// Generic function to show player choices dynamically
function showChoices(options, followUpFn) {
  choicesDiv.innerHTML = "";
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt.text;
    btn.addEventListener("click", () => {
      handlePlayerChoice(opt.text, opt.trust, opt.alert, followUpFn, opt.nextChoice);
    });
    choicesDiv.appendChild(btn);
  });
  enableChoices();
}

// Handle player choice generically
function handlePlayerChoice(message, trustChange = 0, alertText, followUpFn, choiceType) {
  lastChoice = choiceType;
  changeTrust(trustChange);
  disableChoices();
  addPlayerMessage(message);

  setTimeout(() => {
    if (alertText) {
      alert(alertText);
    }
    followUpFn();
  }, 350);
}

// NPC EXPLAINER PAGE
startBtn.addEventListener("click", () => {
  document.getElementById("trust-bar").style.display = "none";

  // Hide intro screen
  introScreen.classList.remove("active");
  introScreen.style.display = "none";

  // Show NPC screen
  npcScreen.style.display = "flex";
  npcScreen.classList.add("active");

  // Beach ambient video
  npcVideo.src = "beach-ambient-video.mp4";
  npcVideo.load();

  // ✅ force play after user click
  npcVideo.muted = true;
  npcVideo.playsInline = true;

  npcVideo.play().catch((e) => {
    console.log("NPC video play blocked:", e);
  });

  startNpcDialogue(0);
});

npcNextBtn.addEventListener("click", () => {
  // if not done typing, ignore clicks
  if (!npcNextBtn.classList.contains("show")) return;

  npcPage++;

  // If more dialogue pages, type next page
  if (npcPage < npcLines.length) {
    startNpcDialogue(npcPage);
    return;
  }

  // Otherwise, go to map
  npcScreen.classList.remove("active");
  npcScreen.style.display = "none";

  renderMap();
});

// ===========================
// NPC Dialogue (typewriter)
// ===========================
const npcLines = [
  "Ahoy! Welcome to SafeQuest. I’m Captain Byte — your guide to surviving the dangers of the online seas.",
  "Your mission: travel through the map, clear all checkpoints, and learn how to spot threats like grooming, impersonation, and image abuse.",
  "Each choice affects your Safety Score. Pick wisely — and when in doubt, protect your privacy and trust your instincts.",
  "Ready? Let’s set sail. Click Next to begin your journey!"
];

let npcPage = 0;
let npcChar = 0;
let npcTypingInterval = null;

function startNpcDialogue(pageIndex = 0) {
  npcPage = pageIndex;
  npcChar = 0;

  // reset
  npcTextEl.textContent = "";
  npcNextBtn.classList.remove("show");

  // stop any previous typing
  if (npcTypingInterval) clearInterval(npcTypingInterval);

  const line = npcLines[npcPage];

  npcTypingInterval = setInterval(() => {
    npcTextEl.textContent += line.charAt(npcChar);
    npcChar++;

    if (npcChar >= line.length) {
      clearInterval(npcTypingInterval);
      npcTypingInterval = null;

      // show Next only when typing finishes
      npcNextBtn.classList.add("show");
    }
  }, 25);
}

// Map captain overlay
function showMapCaptainOverlay() {
  const container = document.getElementById("game-container");

  const existing = document.getElementById("map-captain-overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "map-captain-overlay";

  overlay.innerHTML = `
    <div id="map-npc-ui">
      <img id="map-npc-image" src="pirate-npc.png" alt="Captain Byte">
      <div id="map-npc-box">
        <p id="map-npc-speaker">Captain Byte</p>
        <p id="map-npc-text"></p>
        <button id="map-npc-next-btn">Next</button>
      </div>
    </div>
  `;

  container.appendChild(overlay);

  document.getElementById("map-npc-next-btn").addEventListener("click", () => {
    overlay.remove();
  });

  // ✅ use current stage line
  startMapNpcTypewriter(mapCaptainLines[currentMapStage]);
}

// START GAME Part 1: Online Grooming
function renderMap() {
  const container = document.getElementById("game-container");

  // ✅ show map background video
  mapBgVideo.style.display = "block";
  mapBgVideo.currentTime = 0;
  mapBgVideo.play().catch(() => {});

  // Hide chat screen & clear chat/buttons
  q1Screen.style.display = "none";
  document.querySelector(".chat-container").innerHTML = "";
  choicesDiv.innerHTML = "";

  // Remove old map if any
  const oldImg = document.getElementById("map-image");
  if (oldImg) oldImg.remove();
  const oldMap = document.querySelector("map[name='image-map']");
  if (oldMap) oldMap.remove();

  // Create map image
  const img = document.createElement("img");
  img.src = "intdes-map.png";
  img.alt = "Scenario Map";
  img.useMap = "#image-map";
  img.id = "map-image";
  img.style.maxWidth = "880px";
  img.style.height = "auto";
  img.style.display = "block";
  img.style.margin = "20px auto 0 auto"; // tweak this to align
  img.style.borderRadius = "8px";

  container.appendChild(img);

  showMapCaptainOverlay();

  // Insert map areas
 const mapHTML = `
  <map name="image-map">
    <!-- Checkpoint 1 -->
    <area id="cp1" shape="circle" coords="535,422,66" href="#" alt="Checkpoint 1">

    <!-- Checkpoint 2 -->
    <area id="cp2" shape="circle" coords="290,307,67" href="#" alt="Checkpoint 2">

    <!-- Checkpoint 3 -->
    <area id="cp3" shape="circle" coords="533,234,72" href="#" alt="Checkpoint 3">

    <!-- Treasure / Finish -->
    <area id="treasure" shape="circle" coords="325,111,66" href="#" alt="Treasure">
  </map>
`;

  container.insertAdjacentHTML("beforeend", mapHTML);

  img.onload = () => imageMapResize();

 // Attach checkpoint listeners
document.getElementById("cp1").addEventListener("click", (e) => {
  e.preventDefault();
  startChatPart1();
});

document.getElementById("cp2").addEventListener("click", (e) => {
  e.preventDefault();
  startChatPart2();
});

document.getElementById("cp3").addEventListener("click", (e) => {
  e.preventDefault();
  startChatPart3();
});

document.getElementById("treasure").addEventListener("click", (e) => {
  e.preventDefault();
  showTreasureEnding();
});
}

function startChatPart1() {
  setChatBackground("underwater-ship-video.mp4"); // your current Part 1 video

  trustBar.style.display = "flex";
  mapBgVideo.style.display = "none";
  // Remove the map image and map
  const img = document.getElementById("map-image");
  if (img) img.remove();
  const map = document.querySelector("map[name='image-map']");
  if (map) map.remove();

  // Show Q1 screen
  q1Screen.style.display = "flex";

  // Clear Q1 default buttons immediately
  choicesDiv.innerHTML = "";

  // Stranger message appears first
  addStrangerMessage(
    "Hey! I think we have mutual friends 😊",
    1200,
    () => showQ1Choices()
  );
}

// PART 1 CHOICES Q1
function showQ1Choices() {
  const options = [
    { text: "Sure, let's chat!", trust: -10, alert: "Risky choice!\n\nReplying casually can encourage strangers to ask for personal details.", nextChoice: "risky" },
    { text: "I'm sorry, do i know you?", trust: +10, alert: "Safe choice!\n\nAsking how you know someone helps you verify their identity and spot strangers pretending to be familiar.", nextChoice: "safe" }
  ];
  showChoices(options, addStrangerSecondMessage);
}

// Q2: Second Stranger Message + Dynamic Player Replies
function addStrangerSecondMessage() {
  let options;
  if (lastChoice === "risky") {
    addStrangerMessage("Haha no worries 😄 You seem chill. What school are you from?", 1200, () => {
      options = [
        { text: "I’m from NP 😅, what about you?", trust: -10, alert: "Risky choice!\n\nSharing location details can make it easier for strangers to track you.", nextChoice: "risky" },
        { text: "I’d rather not say.", trust: +10, alert: "Safe choice!\n\nRefusing to share personal information reduces risk.", nextChoice: "safe" }
      ];
      showChoices(options, addStrangerThirdMessage);
    });
  } else {
    addStrangerMessage("I don't think so. But we can get to know each other? 😉", 1200, () => {
      options = [
        { text: "Haha sure, why not!", trust: -10, alert: "Risky choice!\n\nSharing info unnecessarily can increase grooming risk.", nextChoice: "risky" },
        { text: "No thanks, I’m not really comfortable chatting with people I don’t know.", trust: +10, alert: "Safe choice!\n\nAvoiding sharing details reduces risk.", nextChoice: "safe" }
      ];
      showChoices(options, addStrangerThirdMessage);
    });
  }
}

// Q3: Third Stranger Message + Dynamic Player Replies
function addStrangerThirdMessage() {
  let options;
  if (lastChoice === "risky") {
    addStrangerMessage("Cool 😎 Where do you usually hang out around?", 1200, () => {
      options = [
        { text: "I'm usually around somerset! I love singing karaoke there 🎤", trust: -10, alert: "Risky choice!\n\nSharing more personal habits can increase grooming risk.", nextChoice: "risky" },
        { text: "I’d rather not say.", trust: +10, alert: "Safe choice!\n\nKeeping your habits vague reduces online harm risk.", nextChoice: "safe" }
      ];
      showChoices(options, showLearningCard);
    });
  } else {
    addStrangerMessage("Got it! Do you want to chat about something else?", 1200, () => {
      options = [
        { text: "Sure, what do you want to talk about?", trust: -10, alert: "Risky choice!\n\nEngaging too much can increase online harm risk.", nextChoice: "risky" },
        { text: "I think I’ll pass, thanks.", trust: +10, alert: "Safe choice!\n\nStaying vague reduces risk.", nextChoice: "safe" }
      ];
      showChoices(options, showLearningCard);
    });
  }
}

// LEARNING CARD (Part 1: ONLINE GROOMING)
function showLearningCard() {
  choicesDiv.innerHTML = ""; // clear any remaining buttons
  addStrangerMessage(
    "📚 Safety Recap! Part 1: ONLINE GROOMING 📚\n\nRemember to always check profiles, avoid sharing personal details, and trust your instincts. If something feels off, it’s okay to stop replying and protect your space online.",
    500,
    () => addEndChatButton(
    "🎉 Congratulations! You’ve completed Part 1: Online Grooming."
  )
  );
}

// ADD END CHAT BUTTON
function addEndChatButton(alertMessage) {
  const endBtn = document.createElement("button");
  endBtn.textContent = "End Chat";
  endBtn.id = "end-chat-btn";
  endBtn.style.marginTop = "10px";

  choicesDiv.appendChild(endBtn);
  enableChoices();

  endBtn.addEventListener("click", () => {
  alert(alertMessage);

  // ✅ Advance map stage AFTER Part 1
  if (currentMapStage === 0) {
    currentMapStage = 1;
  }

  document.querySelector(".chat-container").innerHTML = "";
  choicesDiv.innerHTML = "";

  showBackToMapButton();
  });
}

// ADD BACK TO MAP BUTTON
function showBackToMapButton() {
  const backBtn = document.createElement("button");
  backBtn.textContent = "Back to Map";
  backBtn.style.marginTop = "10px";

  choicesDiv.appendChild(backBtn);
  enableChoices();

  backBtn.addEventListener("click", () => {
    lastChoice = null;
    trustBar.style.display = "none";
    renderMap();
  });
}

// START GAME Part 2: Impersonation
function startChatPart2() {
  setChatBackground("underwater-ship-video-2.mp4"); // ✅ Part 2 background

  trustBar.style.display = "flex";
  mapBgVideo.style.display = "none";
  // Remove map
  const img = document.getElementById("map-image");
  if (img) img.remove();

  const map = document.querySelector("map[name='image-map']");
  if (map) map.remove();

  // Show chat screen
  q1Screen.style.display = "flex";

  // Clear old chat
  document.querySelector(".chat-container").innerHTML = "";
  choicesDiv.innerHTML = "";

  // FIRST MESSAGE – new topic
  addPart2StrangerMessage(
    "Hi! This is NP IT Support 👋 Your account has suspicious activity.\nClick the link to verify now.",
    1200,
    showPart2Choices
  );
}

// PART 2 CHOICES Q1
function showPart2Choices() {
  const options = [
    { text: "I see, I'll click the link then.", trust: -10, alert: "Risky choice!\n\nClicking links from unknown links can compromise your account.", nextChoice: "risky" },
    { text: "Hmm I'll verify through the official NP portal instead.", trust: +10, alert: "Safe choice!\n\nVerifying through official channels keeps your account secure.", nextChoice: "safe" }
  ];
  showChoices(options, addPart2StrangerSecondMessage);
}

// Q2: Second Stranger Message + Dynamic Player Replies
function addPart2StrangerSecondMessage() {
  let options;
  if (lastChoice === "risky") {
    addPart2StrangerMessage("I see you clicked the link. Can you also send the OTP you receive to fix your account?", 1200, () => {
      options = [
        { text: "Okay, here’s my OTP: 1234", trust: -10, alert: "Risky choice!\n\nSharing OTPs can let scammers access your account immediately.", nextChoice: "risky" },
        { text: "I won't share my OTP. I'll report suspicious messages to NP IT instead.", trust: +10, alert: "Safe choice!\n\nNever share one-time passwords with anyone.", nextChoice: "safe" }
      ];
      showChoices(options, addPart2StrangerThirdMessage);
    });
  } else {
    addPart2StrangerMessage("Thanks for verifying! Just to be extra sure, can you tell me your student ID?", 1200, () => {
      options = [
        { text: "Sure, my student ID is S10XXXXXXX", trust: -10, alert: "Risky choice!\n\nSharing your personal details like your student ID in chat can be misused.", nextChoice: "risky" },
        { text: "Uhh I'll only share through official channels.", trust: +10, alert: "Safe choice!\n\nNever share sensitive information outside verified systems.", nextChoice: "safe" }
      ];
      showChoices(options, addPart2StrangerThirdMessage);
    });
  }
}

// Q3: Third Stranger Message + Dynamic Player Replies
function addPart2StrangerThirdMessage() {
  let options;
  if (lastChoice === "risky") {
    addPart2StrangerMessage("Looks like everything is fine now! But just to be 100% sure, can you tell me your full date of birth? This is to double-check your account.", 1200, () => {
      options = [
        { text: "Yeah of course, it’s DD/MM/YYYY", trust: -10, alert: "Risky choice!\n\nGiving personal info can be misused for identity theft.", nextChoice: "risky" },
        { text: "I don’t share my personal info in chat. I’ll verify through official channels.", trust: +10, alert: "Safe choice!\n\nSharing personal information like your date of birth in chat is unsafe.", nextChoice: "safe" }
      ];
      showChoices(options, showPart2LearningCard);
    });
  } else {
    addPart2StrangerMessage("We still need to verify your login to prevent suspension. Can you tell me your NP portal password?", 1200, () => {
      options = [
        { text: "Oh I see, my password is XXXXXXXX", trust: -10, alert: "Risky choice!\n\nSharing passwords can compromise your account immediately.", nextChoice: "risky" },
        { text: "Sorry I won't share my password. I'll just verify via the official portal thanks.", trust: +10, alert: "Safe choice!\n\nPasswords are private and should never be shared.", nextChoice: "safe" }
      ];
      showChoices(options, showPart2LearningCard);
    });
  }
}

// LEARNING CARD (Part 2: IMPERSONATION)
function showPart2LearningCard() {
  choicesDiv.innerHTML = "";

  addPart2StrangerMessage(
    "📚 Safety Recap! Part 2: IMPERSONATION 📚\n\nScammers often pretend to be official organisations. Always check the sender, don’t click suspicious links, and verify through official platforms.",
    500,
    () => {
      currentMapStage = 2; // ✅ move to stage 2
      addEndChatButton("🎉 Congratulations! You’ve completed Part 2: Impersonation.");
    }
  );
}

// START GAME Part 3: Image Abuse
function startChatPart3() {
  setChatBackground("underwater-ship-video-3.mp4");

  trustBar.style.display = "flex";
  mapBgVideo.style.display = "none";
  // Remove map
  const img = document.getElementById("map-image");
  if (img) img.remove();

  const map = document.querySelector("map[name='image-map']");
  if (map) map.remove();

  // Reset state
  lastChoice = null;

  // Show chat screen
  q1Screen.style.display = "flex";

  // Clear old chat & choices
  document.querySelector(".chat-container").innerHTML = "";
  choicesDiv.innerHTML = "";

  // FIRST MESSAGE – Image Abuse scenario
  addPart3StrangerMessage(
    "Heyyy did you finish the coding assignment already? I'm struggling so bad lol 🥲",
    1200,
    showPart3Choices
  );
}

// PART 3 CHOICES Q1
function showPart3Choices() {
  const options = [
    {
      text: "Yeah, I did. Barely survived tbh 💀",
      alert: "Safe or Risky choice? 🤔\n\nThis part is worth 30 points on the Safety Score!\n\nKeep playing to see what happens next. Remember your choices affect how this situation escalates!",
      nextChoice: "risky"
    },
    {
      text: "Yeah, just submitted. Why?",
      alert: "Safe or Risky choice? 🤔\n\nThis part is worth 30 points on the Safety Score!\n\nKeep playing to see what happens next. Remember your choices affect how this situation escalates!",
      nextChoice: "safe"
    }
  ];

  showChoices(options, addPart3SecondMessage);
}

// Q2: Second Stranger Message + Dynamic Player Replies
function addPart3SecondMessage() {
  if (lastChoice === "risky") {
    addPart3StrangerMessage(
      "Lol same...Btw I just wanted to let you know that you looked really good today 😅",
      1200,
      showPart3SecondChoices
    );
  } else {
    addPart3StrangerMessage(
      "Oh I'm just asking. You looked really good today btw 😅",
      1200,
      showPart3SecondChoices
    );
  }
}

function showPart3SecondChoices() {
  const options = [
    {
      text: "Haha thanks 😳",
      nextChoice: "risky"
    },
    {
      text: "Uh thanks I guess...that's a bit random though.",
      nextChoice: "safe"
    }
  ];

  showChoices(options, addPart3ThirdMessage);
}

// Q3: Third Stranger Message + Dynamic Player Replies
function addPart3ThirdMessage() {
  if (lastChoice === "risky") {
    addPart3StrangerMessage(
      "Haha sorry if that was weird! Do you take a lot of selfies?",
      1200,
      showPart3ThirdChoices
    );
  } else {
    addPart3StrangerMessage(
      "Haha okay 😬 Random question but do you take selfies often?",
      1200,
      showPart3ThirdChoices
    );
  }
}

function showPart3ThirdChoices() {
  const options = [
    {
      text: "Yeah sometimes I guess!",
      nextChoice: "risky"
    },
    {
      text: "Not really, I don’t like taking photos.",
      nextChoice: "safe"
    }
  ];

  showChoices(options, addPart3FourthMessage);
}

// Q4: Fourth Stranger Message + Dynamic Player Replies
function addPart3FourthMessage() {
  if (lastChoice === "risky") {
    addPart3StrangerMessage(
      "Oh I see 👀 Could I see one? Just curious haha",
      1200,
      showPart3FourthChoices
    );
  } else {
    addPart3StrangerMessage(
      "Ah okay 😅 I was just curious. Maybe you could make an exception and send one of you right now?",
      1200,
      showPart3FourthChoices
    );
  }
}

function showPart3FourthChoices() {
  const options = [
    {
      text: "Uh...sure? Just don’t save it okay.",
      trust: -30,
      alert: "Serious risk! -30 points\n\nThe stranger now has leverage over you. Image abuse often escalates quietly: once control is lost, it’s hard to regain.",
      nextChoice: "risky"
    },
    {
      text: "I’m not really comfortable sending photos, sorry.",
      trust: +30,
      alert: "You protected yourself! +30 points\n\nSetting boundaries early stopped the situation from escalating. Image abuse thrives on silence and compliance.",
      nextChoice: "safe"
    }
  ];

  showChoices(options, showPart3LearningCard);
}

// LEARNING CARD (Part 3: IMPERSONATION)
function showPart3LearningCard() {
  choicesDiv.innerHTML = "";

  addPart3StrangerMessage(
    "📚 Safety Recap! Part 3: IMAGE ABUSE 📚\n\nNever give in to threats involving images. Save evidence, block the abuser, report the account, and seek help from trusted adults or authorities.",
    500,
    () => {
      currentMapStage = 3; // ✅ move to stage 3
      addEndChatButton("🎉 Congratulations! You’ve completed Part 3: Image Abuse.");
    }
  );
}

// FINAL TREASURE (TAKEAWAYS)
function showTreasureEnding() {
  document.getElementById("trust-bar").style.display = "none";
  mapBgVideo.style.display = "none";
  q1Screen.style.display = "none"; // hide chat screen

  const container = document.getElementById("game-container");
  container.innerHTML = "";

  const treasureScreen = document.createElement("div");
  treasureScreen.id = "treasure-screen";

  // Treasure background video
const treasureBgVideo = document.createElement("video");
treasureBgVideo.id = "treasure-bg-video";
treasureBgVideo.src = "pirate-ship-sunset-video.mp4";
treasureBgVideo.autoplay = true;
treasureBgVideo.loop = true;
treasureBgVideo.muted = true;
treasureBgVideo.playsInline = true;

treasureScreen.innerHTML = `
  <video id="treasure-bg-video" autoplay muted loop playsinline>
    <source src="pirate-ship-sunset-video.mp4" type="video/mp4">
  </video>

  <div id="treasure-ui">
    <h2 class="treasure-title">
      <span id="treasure-typewriter">
        <span class="line-1"></span>
        <span class="line-2"></span>
      </span>
    </h2>

    <p class="treasure-hint fade-after-type">Click the CHEST to reveal what you’ve learnt</p>

    <div id="treasure-chest">
      <img 
        src="treasure-chest-closed.png" 
        alt="Treasure Chest"
        class="treasure-chest-img"
      >
    </div>

    <div id="cards-container">
      ${createFlipCard("Online Grooming", "Don't share personal details like your age, school, or location online.\n\nTrust your instincts. If something feels off, stop engaging.\n\nReport and block anyone who makes you uncomfortable.", 0)}
      ${createFlipCard("Impersonation", "Always verify identities before trusting messages or links.\n\nAvoid clicking on links from unknown or suspicious accounts.\n\nUse official channels to confirm requests or communications.", 1)}
      ${createFlipCard("Image Abuse", "Never feel pressured to share images, your privacy matters.\n\nSave evidence and report any misuse or threats immediately.\n\nSeek help from trusted adults or authorities if targeted.", 2)}
    </div>
  </div>
`;

  container.appendChild(treasureScreen);

  startTreasureTypewriter(() => {
  const hint = document.querySelector(".treasure-hint.fade-after-type");
  if (hint) hint.classList.add("show");
});

const chest = treasureScreen.querySelector("#treasure-chest");

chest.addEventListener("click", () => {
  treasureScreen.classList.add("revealed");
  treasureScreen.classList.add("gift-screen");

  // ✅ CHANGE THE HINT TEXT (only affects this treasure screen instance)
  const hint = treasureScreen.querySelector(".treasure-hint");
  if (hint) {
    hint.textContent = "Click the COIN CARD to reveal what you’ve learnt";
  }

  chest.style.pointerEvents = "none"; // prevents multiple clicks

  // ✅ swap to OPEN CHEST IMAGE (gift screen only)
  chest.innerHTML = `
    <img 
      src="treasure-chest-open.png" 
      alt="Treasure Chest Open"
      class="treasure-chest-img"
    >
  `;
});
}

// Generate flip cards
function createFlipCard(title, takeaway, index) {
  // Split takeaway by line breaks into an array
  const points = takeaway.split("\n\n").map(pt => pt.trim()).filter(Boolean);

  // Build HTML list
  const listHTML = points.map(pt => `<li>${pt}</li>`).join("");

  return `
    <div class="flip-card" data-index="${index}" style="${index !== 0 ? 'display:none;' : ''}">
      <div class="flip-card-inner">
        <div class="flip-card-front">🪙</div>
        <div class="flip-card-back">
          <h3>${title}</h3>
          <ul class="takeaways">
            ${listHTML}
          </ul>
          <button class="claim-coin-btn" style="display:none; margin-top:10px;">Claim Coin</button>
        </div>
      </div>
    </div>
  `;
}

// Make chest clickable to reveal cards
function activateChest() {
  const chest = document.getElementById("treasure-chest");
  const cards = document.getElementById("cards-container");

  chest.addEventListener("click", () => {
    chest.classList.remove("closed");
    chest.classList.add("open");

    cards.classList.remove("hidden");
  });
}

// Initialise trust bar visually
trustFill.style.width = trustLevel + "%"; // 50%
trustFill.style.background = "#f5c542"; // yellow
document.getElementById("trust-label").textContent = "UNKNOWN"; // label stays unknown

// Chest click logic
document.addEventListener("click", (e) => {
  const card = e.target.closest(".flip-card");
  if (card) {
    const inner = card.querySelector(".flip-card-inner");
    inner.classList.add("flipped");

    // Show "Claim Coin" button after flipping
    const claimBtn = card.querySelector(".claim-coin-btn");
    claimBtn.style.display = "block";
  }

  const claimBtnClicked = e.target.closest(".claim-coin-btn");
  if (claimBtnClicked) {
    const currentCard = claimBtnClicked.closest(".flip-card");
    const cards = document.querySelectorAll("#cards-container .flip-card");
    const currentIndex = parseInt(currentCard.dataset.index);

    // Hide current card
    currentCard.style.display = "none";

    // Show next card if exists
    const nextCard = Array.from(cards).find(c => parseInt(c.dataset.index) === currentIndex + 1);
    if (nextCard) {
      nextCard.style.display = "flex";
  } else {
    alert("All coins claimed! 💰");
    showEndScreen(); // 👈 THIS is the key line
  }
  }
});

function showEndScreen() {
  const container = document.getElementById("game-container");

  // Clear everything
  container.innerHTML = "";

  // Create end screen
  const endScreen = document.createElement("div");
  endScreen.id = "end-screen";

  endScreen.innerHTML = `
  <video id="end-bg-video" autoplay muted loop playsinline>
    <source src="pirate-ship-night-video.mp4" type="video/mp4">
  </video>

  <div id="end-ui">
    <h2>
      <span id="end-typewriter"></span><span class="cursor">|</span>
    </h2>

    <p id="end-paragraph">Thanks for playing and learning how to stay safe online!</p>
    <button id="return-home-btn">Return to Home Screen</button>
  </div>
`;

  container.appendChild(endScreen);
  startEndScreenAnimation();

  // Button logic
  document.getElementById("return-home-btn").addEventListener("click", () => {
    location.reload();
  });
}

function startEndScreenAnimation() {
  const endTypeEl = document.getElementById("end-typewriter");
  const endParagraph = document.getElementById("end-paragraph");
  const returnBtn = document.getElementById("return-home-btn");

  if (!endTypeEl || !endParagraph || !returnBtn) return;

  // reset to hidden states
  endTypeEl.textContent = "";
  endParagraph.classList.remove("show");
  returnBtn.classList.remove("show");

  const endText = "You’ve reached the end of SafeQuest";
  let i = 0;

  const interval = setInterval(() => {
    endTypeEl.textContent += endText.charAt(i);
    i++;

    if (i >= endText.length) {
      clearInterval(interval);

      // fade in paragraph
      setTimeout(() => {
        endParagraph.classList.add("show");

        // slide in button
        setTimeout(() => {
          returnBtn.classList.add("show");
        }, 600);

      }, 300);
    }
  }, 40); // same speed as your intro typewriter
}

startTypewriter();

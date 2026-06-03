(function(){
  var OWNER_HASH = "660b53b077707bd7221f880993431e1b1ef0cb4ff7670320a169c6a068817f62";
  var PRODUCT_ID = "n7oKRu8e3hy8pVr1mP4WBw==";
  var GUMROAD_URL = "https://builttohoop.gumroad.com/l/thxqs";
  var currentScreen = "home";
  var CONTENT_CACHE_KEY = "bth_content_cache_v1";
  var APP_STATE_KEY = "bth_app_state_v17";
  var librarySearch = "";
  var tourIndex = 0;
  var intakeIndex = 0;
  var reminderTimer = null;
  var lastReminderDayId = "";

  var APP_CONTENT = {
    updates: [
      {
        id: "welcome-home",
        date: "2026-06-03",
        title: "The app is live",
        body: "BTH now has a home. Free reset, member unlock, and the library all run through the app.",
        tag: "App",
        pinned: true
      }
    ],
    drops: [],
    clothes: [],
    affiliate: {
      headline: "Put people on. Get paid.",
      body: "Know a hooper who needs this? Send them in. You earn $10 for every paid membership you bring - and when you hit 10, that is an extra $50 on top. Ten paid = $150.",
      terms: {perReferral:10, bonus:50, bonusAt:10},
      ctaLabel: "Join the affiliate program",
      formUrl: ""
    }
  };

  var CONTENT_FILES = {
    updates: "content/updates.json",
    drops: "content/drops.json",
    clothes: "content/clothes.json",
    affiliate: "content/affiliate.json"
  };

  var ONBOARDING_STEPS = [
    "Welcome to Built to Hoop. This is your home now - training, updates, drops, all in one place. 20 seconds and you are in.",
    "This is your day. Open the app, see what is next, hit it. No guessing.",
    "Your library lives in Train - Restore, Rebuild, and your add-on tracks. Everything is built to keep you on the court.",
    "Updates and Drops are where new work and new gear show up. Check in - we keep this moving."
  ];

  var INTAKE_QUESTIONS = [
    {id:"firstName", type:"text", label:"What is your name?"},
    {id:"years", type:"choice", label:"How long you been hooping?", options:["Under 5","5-15","15+ years"]},
    {id:"goal", type:"choice", label:"What are you here for?", options:["Get my bounce back","Stay healthy & keep playing","Get stronger","Move better"]},
    {id:"nagging", type:"choice", label:"Anything nagging you right now?", options:["Knees","Ankles","Hips","Back","Nothing major"]},
    {id:"days", type:"choice", label:"Days a week you can train?", options:["2","3","4+"]}
  ];

  var GOAL_SUBLINES = {
    "Get my bounce back": "Today is about getting your pop back.",
    "Stay healthy & keep playing": "Today is about staying on the court.",
    "Get stronger": "Today we build.",
    "Move better": "Today we clean up how you move."
  };

  var GOAL_TRACKS = {
    "Get my bounce back": "performance-track",
    "Stay healthy & keep playing": "foundation-month",
    "Get stronger": "operator-phase-2-rebuild",
    "Move better": "foundation-month"
  };

  var NAGGING_TRACKS = {
    "Knees": "knee-protection",
    "Ankles": "ankle-rebuild",
    "Hips": "hip-reset",
    "Back": "recovery-system"
  };

  var REMINDER_COPY = {
    title: "Built to Hoop",
    body: "Stay ready - your next session's waiting."
  };

  function appEsc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(ch){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch];
    });
  }

  function appLoad(key, fallback){
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function appSave(key, value){
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  function appRemove(key){
    try { localStorage.removeItem(key); } catch (e) {}
  }

  function getAppState(){
    var state = appLoad(APP_STATE_KEY, {});
    state.intake = state.intake || {};
    state.seenUpdateIds = state.seenUpdateIds || [];
    state.training = state.training || {};
    state.training.completedDayIds = state.training.completedDayIds || [];
    state.notifyMe = state.notifyMe || [];
    return state;
  }

  function saveAppState(state){
    appSave(APP_STATE_KEY, state);
  }

  function patchAppState(patch){
    var state = getAppState();
    Object.keys(patch).forEach(function(key){ state[key] = patch[key]; });
    saveAppState(state);
    return state;
  }

  function getActiveDayId(){
    var now = new Date();
    var rolloverHour = 4;
    if (now.getHours() < rolloverHour) {
      now.setDate(now.getDate() - 1);
    }
    var y = now.getFullYear();
    var m = String(now.getMonth() + 1).padStart(2, "0");
    var d = String(now.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  function getIntake(){
    return getAppState().intake || {};
  }

  function cleanFirstName(name){
    return String(name || "").trim().split(/\s+/)[0] || "";
  }

  function getStoredTheme(){
    var state = getAppState();
    if (state.theme === "light" || state.theme === "dark") return state.theme;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function getReducedMotion(){
    var state = getAppState();
    if (typeof state.reduceMotion === "boolean") return state.reduceMotion;
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function applyAppPrefs(){
    var theme = getStoredTheme();
    document.body.classList.toggle("theme-dark", theme === "dark");
    document.body.classList.toggle("theme-light", theme !== "dark");
    document.body.classList.toggle("reduce-motion", getReducedMotion());
  }

  function setTheme(theme){
    patchAppState({theme:theme === "dark" ? "dark" : "light"});
    applyAppPrefs();
    renderBthApp();
  }

  function setReduceMotion(value){
    patchAppState({reduceMotion:!!value});
    applyAppPrefs();
    renderBthApp();
  }

  function mergeContentCache(cache){
    if (!cache || typeof cache !== "object") return;
    ["updates","drops","clothes","affiliate"].forEach(function(key){
      if (cache[key]) APP_CONTENT[key] = cache[key];
    });
  }

  function loadCachedContent(){
    mergeContentCache(appLoad(CONTENT_CACHE_KEY, null));
  }

  function loadContent(){
    loadCachedContent();
    return Promise.all(Object.keys(CONTENT_FILES).map(function(key){
      return fetch(CONTENT_FILES[key] + "?v=" + Date.now(), {cache:"no-store"})
        .then(function(response){
          if (!response.ok) throw new Error(key + " " + response.status);
          return response.json();
        })
        .then(function(data){ APP_CONTENT[key] = data; })
        .catch(function(){});
    })).then(function(){
      appSave(CONTENT_CACHE_KEY, APP_CONTENT);
      renderBthApp();
    });
  }

  function getUpdatesNewestFirst(){
    return (APP_CONTENT.updates || []).slice().sort(function(a,b){
      if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
      return String(b.date || "").localeCompare(String(a.date || ""));
    });
  }

  function unreadUpdateCount(){
    var seen = getAppState().seenUpdateIds || [];
    return (APP_CONTENT.updates || []).filter(function(item){
      return item && item.id && seen.indexOf(item.id) === -1;
    }).length;
  }

  function markUpdatesSeen(){
    var state = getAppState();
    var seen = state.seenUpdateIds || [];
    (APP_CONTENT.updates || []).forEach(function(item){
      if (item && item.id && seen.indexOf(item.id) === -1) seen.push(item.id);
    });
    state.seenUpdateIds = seen;
    saveAppState(state);
  }

  function getRecommendedProgram(){
    var intake = getIntake();
    var byNagging = NAGGING_TRACKS[intake.nagging];
    var byGoal = GOAL_TRACKS[intake.goal];
    var id = byNagging || byGoal || "foundation-month";
    return BTH_LIBRARY.filter(function(program){ return program.id === id; })[0] || BTH_LIBRARY[0];
  }

  function getContinueTarget(){
    var state = getAppState();
    if (state.training && state.training.lastProgramId) {
      var saved = BTH_LIBRARY.filter(function(program){ return program.id === state.training.lastProgramId; })[0];
      if (saved) return saved;
    }
    return getRecommendedProgram();
  }

  function makeDayId(programId, week, day){
    return [programId, "w" + week, "d" + day].join("-");
  }

  function isDayDone(dayId){
    return (getAppState().training.completedDayIds || []).indexOf(dayId) !== -1;
  }

  function toggleDayDone(dayId, programId, week, day){
    var state = getAppState();
    var completed = state.training.completedDayIds || [];
    var idx = completed.indexOf(dayId);
    if (idx === -1) completed.push(dayId);
    else completed.splice(idx, 1);
    state.training.completedDayIds = completed;
    state.training.lastProgramId = programId;
    state.training.lastWeek = week;
    state.training.lastDay = day;
    state.training.lastOperatorDayId = getActiveDayId();
    saveAppState(state);
    renderBthApp();
  }

  function setLibrarySearch(value){
    librarySearch = String(value || "");
    renderBthApp();
  }

  function jumpDay(dayId){
    var node = document.getElementById(dayId);
    if (node) node.scrollIntoView({behavior:getReducedMotion() ? "auto" : "smooth", block:"start"});
  }

  function hasCompletedOnboarding(){
    return !!appLoad("bth_onboarding_complete", false);
  }

  function shouldShowOnboarding(){
    return !hasCompletedOnboarding() && currentScreen !== "account" && currentScreen !== "settings";
  }

  function resetOnboarding(){
    tourIndex = 0;
    intakeIndex = 0;
    appSave("bth_intro_done", false);
    appSave("bth_onboarding_complete", false);
    currentScreen = "home";
    renderBthApp();
  }

  function showColdOpen(){
    if (getReducedMotion()) return;
    var seen = !!appLoad("bth_cold_open_seen", false);
    var overlay = document.createElement("div");
    overlay.id = "bth-cold-open";
    overlay.innerHTML = '<button type="button" class="cold-skip" aria-label="Skip intro">Skip</button><div class="cold-mark">Built to Hoop</div><div class="cold-line">Stay Ready</div>';
    document.body.appendChild(overlay);
    function close(){
      overlay.classList.add("done");
      window.setTimeout(function(){ if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 220);
    }
    overlay.querySelector("button").onclick = close;
    window.setTimeout(close, seen ? 800 : 1400);
    appSave("bth_cold_open_seen", true);
  }

  function requestNotificationPermission(){
    if (!("Notification" in window)) {
      window.alert("This browser does not support notifications.");
      return;
    }
    Notification.requestPermission().then(function(){
      renderBthApp();
    });
  }

  function fireReminder(){
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    try {
      new Notification(REMINDER_COPY.title, {body:REMINDER_COPY.body, tag:"bth-reminder"});
      lastReminderDayId = getActiveDayId();
    } catch (e) {}
  }

  function reminderTick(){
    var state = getAppState();
    if (state.remindersOff) return;
    if (document.hidden) return;
    var dayId = getActiveDayId();
    var last = state.lastReminderDayId || lastReminderDayId;
    if (last === dayId) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    state.lastReminderDayId = dayId;
    saveAppState(state);
    fireReminder();
  }

  function startReminderLoop(){
    if (reminderTimer) return;
    reminderTimer = window.setInterval(reminderTick, 30000);
    document.addEventListener("visibilitychange", reminderTick);
  }

  function registerServiceWorker(){
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("sw.js").catch(function(){});
  }

  function getMode(){
    if (appLoad("bth_owner_access", null)) return "owner";
    if (appLoad("bth_member_access", null)) return "member";
    return "free";
  }

  function setScreen(screen){
    currentScreen = screen;
    renderBthApp();
  }

  function isUnlocked(){
    var mode = getMode();
    return mode === "member" || mode === "owner";
  }

  function todoExercise(label){
    return {
      name: "TODO: content - " + label,
      sets: "TODO",
      reps: "TODO",
      cues: ["TODO: content"],
      restSeconds: null,
      redFlags: ["TODO: content"],
      videoUrl: ""
    };
  }

  var FREE_RESET = [
    {
      day: 1,
      title: "Hip Release",
      subtitle: "Open what pickup locks.",
      sourceUrl: "https://built-to-hoop.com/reset-pdfs/output/BTH-Reset-Day-01-Hip-Release.pdf",
      exercises: [
        {name:"90/90 Hip Switch", sets:"3 rounds", reps:"30 sec each side", cues:["Sit on the floor, both legs bent at 90 degrees.","Rotate slowly side to side.","Let the back hip open; do not force it."], videoUrl:""},
        {name:"Couch Stretch", sets:"2 rounds", reps:"45 sec each leg", cues:["Back knee on the floor, front foot forward.","Drive hips forward.","Keep your glute squeezed on the rear leg."], videoUrl:""},
        {name:"Glute Bridge Hold", sets:"3 rounds", reps:"10 reps + 3 sec hold", cues:["Feet flat, drive through your heels.","Squeeze hard at the top.","Hold 3 seconds."], videoUrl:""}
      ],
      note: "You will feel this working before you finish. That is the hip flexors and glutes activating like they are supposed to."
    },
    {
      day: 2,
      title: "Ankle Reset",
      subtitle: "Rebuild the joints your body stopped trusting.",
      sourceUrl: "https://built-to-hoop.com/reset-pdfs/output/BTH-Reset-Day-02-Ankle-Reset.pdf",
      exercises: [
        {name:"Tibialis Raise", sets:"3", reps:"15 reps", cues:["Stand with your back against a wall, heels 6 inches out.","Lift your toes toward your shins."], videoUrl:""},
        {name:"Calf Raise Eccentric", sets:"3", reps:"10 reps, 3 sec down, explode up", cues:["Two feet up, one foot down.","Use a slow 3-count on the way down."], videoUrl:""},
        {name:"Single-Leg Balance Reach", sets:"2", reps:"30 sec each leg", cues:["Stand on one leg.","Reach the other forward, side, and back without letting your hip drop."], videoUrl:""}
      ],
      note: "Run these in order and do not rush the eccentrics."
    },
    {
      day: 3,
      title: "Knee + Quad Reset",
      subtitle: "Fix the patellar load before it becomes a problem.",
      sourceUrl: "https://built-to-hoop.com/reset-pdfs/output/BTH-Reset-Day-03-Knee-Quad-Reset.pdf",
      exercises: [
        {name:"Spanish Squat", sets:"3", reps:"10 reps, 3 sec hold at bottom", cues:["Use a strap or post for support.","Heels flat, squat deep, hold 3 seconds at the bottom."], videoUrl:""},
        {name:"VMO Lunge", sets:"3", reps:"8 each leg", cues:["Front foot elevated slightly on a small step or plate.","Drop the back knee slowly."], videoUrl:""},
        {name:"Single-Leg Glute Bridge", sets:"2", reps:"12 each leg", cues:["One leg in the air.","Drive through the heel on the planted foot.","Squeeze hard at the top."], videoUrl:""}
      ],
      note: "The Spanish Squat is direct patellar tendon work. Do not skip it."
    },
    {
      day: 4,
      title: "Core + Movement Quality",
      subtitle: "The stability that makes your first step matter.",
      sourceUrl: "https://built-to-hoop.com/reset-pdfs/output/BTH-Reset-Day-04-Core-Movement-Quality.pdf",
      exercises: [
        {name:"Dead Bug", sets:"3", reps:"8 each side", cues:["Back flat on the floor.","Slowly extend opposite arm and leg.","Do not let your lower back arch."], videoUrl:""},
        {name:"Pallof Press", sets:"3", reps:"10 each side", cues:["Use a band anchored at chest height, or a cable machine.","Press straight out and hold 2 seconds."], videoUrl:""},
        {name:"90/90 to Tall Kneeling", sets:"2", reps:"5 each side", cues:["Sit in 90/90 hip position.","Rise to tall kneeling without using your hands."], videoUrl:""}
      ],
      note: "The second your back arches on Dead Bug, the rep is done."
    },
    {
      day: 5,
      title: "Power Reset",
      subtitle: "Bring the bounce back the right way.",
      sourceUrl: "https://built-to-hoop.com/reset-pdfs/output/BTH-Reset-Day-05-Power-Reset.pdf",
      exercises: [
        {name:"Hip Reset Recap", sets:"1 round", reps:"Full Day 1 sequence", cues:["Run through all three Day 1 exercises before loading power work."], videoUrl:""},
        {name:"Box Step-Up + Drive", sets:"3", reps:"6 each leg", cues:["Step onto a 12-18 inch box.","Drive the opposite knee hard at the top.","Control the step down."], videoUrl:""},
        {name:"Broad Jump + Stick", sets:"4 reps", reps:"Full reset between each", cues:["Jump forward, land on two feet, and stick it for 3 full seconds.","No wobble, no extra steps."], videoUrl:""}
      ],
      note: "Use Day 5 as a readiness check: if you are looser than Monday, the system is working."
    }
  ];

  var CONTENT_GAPS = [
    {area:"Foundation Month / Phase 1 Restore / Week 1 Day 1", gap:"Docx defines the phase and offer, but no exact exercise prescription was present."},
    {area:"Foundation Month / Phase 1 Restore / Week 1 Day 2", gap:"Missing exact exercises, sets, reps, cues, rest, and red flags."},
    {area:"Foundation Month / Phase 1 Restore / Week 1 Day 3", gap:"Missing exact exercises, sets, reps, cues, rest, and red flags."},
    {area:"Foundation Month / Phase 1 Restore / Week 2 Day 1", gap:"Missing exact exercises, sets, reps, cues, rest, and red flags."},
    {area:"Foundation Month / Phase 1 Restore / Week 2 Day 2", gap:"Missing exact exercises, sets, reps, cues, rest, and red flags."},
    {area:"Foundation Month / Phase 1 Restore / Week 2 Day 3", gap:"Missing exact exercises, sets, reps, cues, rest, and red flags."},
    {area:"Foundation Month / Phase 2 Rebuild mapping", gap:"The operator has a real 4-week Phase 2 block, but the docx does not specify exact Foundation Month week 3-4 mapping."},
    {area:"Performance Track / Phases 3-5", gap:"Docx describes the phases and weekly split, but not the full workout cards."},
    {area:"Hip Reset Track", gap:"Docx gives a 14-day hip stabilizer rebuild description, but not day-by-day exercise cards."},
    {area:"Knee Protection Track", gap:"Docx names patellar tendon, quad/glute med, and deceleration work, but not exact programming."},
    {area:"Ankle Rebuild Track", gap:"Docx names tibialis, calf loading, single-leg stability, and return-to-court readiness, but not exact programming."},
    {area:"Skill Builder", gap:"Docx names shooting, ball-handling, 30-min/40-min formats, and skill week structure, but no exact sessions."},
    {area:"Recovery System", gap:"Docx names post-pickup reset, night routine, work-break protocol, sleep positioning, and hydration formula, but no exact protocols."}
  ];

  function buildTodoDay(dayNumber, title){
    return {
      day: dayNumber,
      title: title,
      focus: "TODO: content",
      exercises: [todoExercise(title)],
      notes: ["TODO: content"],
      videoUrl: ""
    };
  }

  function phase2ExerciseFromOperator(ex, weekIndex){
    var dose = (ex.weeks && ex.weeks[weekIndex]) || "TODO";
    var parts = dose.split(/[xX×]/);
    return {
      name: ex.name,
      sets: parts[0] ? parts[0].trim() : dose,
      reps: parts[1] ? parts.slice(1).join("x").trim() : dose,
      prescription: dose,
      cues: ex.note ? [ex.note] : [],
      restText: ex.rest || "",
      restSeconds: null,
      category: ex.cat || "",
      tag: ex.tag || "",
      redFlags: [],
      videoUrl: ""
    };
  }

  function buildOperatorPhase2Program(){
    if (typeof PHASE2 === "undefined" || !PHASE2.days) return null;
    return {
      id: "operator-phase-2-rebuild",
      title: "Phase 2 Rebuild - Jump & Lean Block",
      tier: "member",
      status: "available",
      source: "Ported from existing bth-operator-v2 TRAIN tab",
      description: "Four-week lower/upper block with jump, sprint, tendon, strength, upper, nutrition-support, and weekly intent data already present in the operator app.",
      phases: [{
        id: "phase-2-rebuild",
        title: "Phase 2 - Rebuild",
        weeks: [0,1,2,3].map(function(weekIndex){
          var intent = PHASE2.weekIntent[weekIndex] || {};
          return {
            week: weekIndex + 1,
            title: intent.goal || ("Week " + (weekIndex + 1)),
            intent: intent.feel || "",
            days: PHASE2.days.map(function(day){
              return {
                day: day.num,
                title: day.title,
                focus: day.sub,
                type: day.type,
                exercises: (day.exercises || []).map(function(ex){ return phase2ExerciseFromOperator(ex, weekIndex); }),
                finisher: day.finisher ? {title:day.finisher.title, description:day.finisher.desc, prescription:day.finisher.weeks[weekIndex] || ""} : null,
                videoUrl: ""
              };
            })
          };
        })
      }]
    };
  }

  function buildLibrary(){
    var library = [
      {
        id:"foundation-month",
        title:"Foundation Month",
        tier:"member",
        status:"partial",
        source:"BTH_Creation_File_2.0.docx",
        description:"Month 1 of BTH Rise. Covers Phases 1-2: Reset + Rebuild. Exact Phase 1 workout cards are not in the docx yet.",
        phases:[
          {id:"phase-1-restore", title:"Phase 1 - Restore", weeks:[
            {week:1, title:"Calm the noise", days:[buildTodoDay(1,"Restore Day 1"), buildTodoDay(2,"Restore Day 2"), buildTodoDay(3,"Restore Day 3")]},
            {week:2, title:"Restore confidence to load", days:[buildTodoDay(1,"Restore Day 1"), buildTodoDay(2,"Restore Day 2"), buildTodoDay(3,"Restore Day 3")]}
          ]},
          {id:"phase-2-rebuild-placeholder", title:"Phase 2 - Rebuild", weeks:[
            {week:3, title:"TODO: content - Foundation mapping", days:[buildTodoDay(1,"Rebuild Day 1"), buildTodoDay(2,"Rebuild Day 2"), buildTodoDay(3,"Rebuild Day 3")]},
            {week:4, title:"TODO: content - Foundation mapping", days:[buildTodoDay(1,"Rebuild Day 1"), buildTodoDay(2,"Rebuild Day 2"), buildTodoDay(3,"Rebuild Day 3")]}
          ]}
        ]
      },
      {
        id:"performance-track",
        title:"Performance Track",
        tier:"member",
        status:"partial",
        source:"BTH_Creation_File_2.0.docx",
        description:"Month 2+ of BTH Rise. Docx defines Phases 3-5 and the weekly split; exact workout cards still need content.",
        phases:[
          {id:"phase-3-strength-to-bounce", title:"Phase 3 - Strength to Bounce", weeks:[{week:1,title:"TODO: content",days:[buildTodoDay(1,"Lower Power"),buildTodoDay(2,"Upper Power"),buildTodoDay(3,"Mobility")]}]},
          {id:"phase-4-game-speed", title:"Phase 4 - Game Speed", weeks:[{week:1,title:"TODO: content",days:[buildTodoDay(1,"Full Body Power"),buildTodoDay(2,"Arms + Core"),buildTodoDay(3,"Skill Day")]}]},
          {id:"phase-5-stay-ready", title:"Phase 5 - Stay Ready", weeks:[{week:1,title:"TODO: content",days:[buildTodoDay(1,"Stay Ready Day")]}]}
        ]
      }
    ];
    var operatorPhase2 = buildOperatorPhase2Program();
    if (operatorPhase2) library.push(operatorPhase2);
    [
      ["hip-reset","BTH Hip Reset Track","14-day hip stabilizer rebuild program for hip pinching, instability, or old-injury breakdown."],
      ["knee-protection","BTH Knee Protection Track","Patellar tendon loading, quad/glute med strengthening, and deceleration work."],
      ["ankle-rebuild","BTH Ankle Rebuild Track","Tibialis protocols, calf loading, single-leg stability, and return-to-court readiness."],
      ["skill-builder","BTH Skill Builder","Structured shooting and ball-handling program with 30-min and 40-min formats."],
      ["recovery-system","BTH Recovery System","Post-pickup reset, night routine, work-break protocol, sleep positioning, and hydration formula."]
    ].forEach(function(item){
      library.push({
        id:item[0],
        title:item[1],
        tier:"member",
        status:"todo",
        source:"BTH_Creation_File_2.0.docx",
        description:item[2],
        phases:[{id:item[0] + "-phase", title:"TODO: content", weeks:[{week:1,title:"TODO: content",days:[buildTodoDay(1,item[1] + " Day 1")]}]}]
      });
    });
    return library;
  }

  var BTH_LIBRARY = buildLibrary();

  function ensureAppShell(){
    if (!document.getElementById("bth-app-root")) {
      var root = document.createElement("div");
      root.id = "bth-app-root";
      document.body.insertBefore(root, document.body.firstChild);
    }
    if (!document.getElementById("bth-app-nav")) {
      var nav = document.createElement("nav");
      nav.id = "bth-app-nav";
      document.body.appendChild(nav);
    }
    if (!document.getElementById("bth-owner-exit")) {
      var btn = document.createElement("button");
      btn.id = "bth-owner-exit";
      btn.type = "button";
      btn.textContent = "Back to app";
      btn.onclick = closeOwnerTools;
      document.body.appendChild(btn);
    }
  }

  function renderNav(mode){
    var nav = document.getElementById("bth-app-nav");
    var unread = unreadUpdateCount();
    var items = [
      ["home","Home","BTH"],
      ["reset","Reset","5"],
      ["library","Train","LIB"],
      ["updates","Updates", unread ? String(unread) : "UP"],
      ["settings","Settings","SET"],
      ["account","Access","KEY"]
    ];
    if (mode === "owner") items.push(["owner","Owner","TY"]);
    nav.innerHTML = items.map(function(item){
      var hasBadge = item[0] === "updates" && unread > 0;
      return '<button class="app-nav-btn '+(currentScreen===item[0]?'active':'')+'" data-screen="'+item[0]+'" aria-label="'+appEsc(item[1])+'"><span class="app-nav-icon '+(hasBadge?'has-badge':'')+'">'+appEsc(item[2])+'</span><span class="app-nav-label">'+appEsc(item[1])+'</span></button>';
    }).join("");
    Array.prototype.forEach.call(nav.querySelectorAll("[data-screen]"), function(button){
      button.onclick = function(){
        var target = button.getAttribute("data-screen");
        if (target === "owner") openOwnerTools();
        else setScreen(target);
      };
    });
  }

  function appHero(title, copy, chips){
    return '<div class="app-hero"><div class="app-kicker">Built to Hoop</div><div class="app-hero-title">'+appEsc(title)+'</div><div class="app-hero-copy">'+appEsc(copy)+'</div><div class="mode-chip-row">'+(chips||[]).map(function(c){return '<span class="mode-chip">'+appEsc(c)+'</span>';}).join("")+'</div></div>';
  }

  function renderHome(mode){
    var intake = getIntake();
    var firstName = cleanFirstName(intake.firstName);
    var greeting = firstName ? "Let's work, " + firstName + "." : "Let's work.";
    var subline = GOAL_SUBLINES[intake.goal] || "Open the app, see what is next, hit it.";
    var recommended = getRecommendedProgram();
    var continueTarget = getContinueTarget();
    var updates = getUpdatesNewestFirst().slice(0, 2);
    var html = appHero(greeting, subline, [mode.toUpperCase(), intake.days ? intake.days + " days/week" : "Set your week", "Local progress"]);
    html += '<div class="app-card app-lift-card"><div class="app-card-meta">Continue</div><div class="app-card-title">'+appEsc(continueTarget.title)+'</div><div class="app-copy">Pick up from your current training lane. State stays on this device and follows the BTH operator-day model.</div><button class="btn-primary" onclick="BTHApp.go(\'library\')">Open Train</button></div>';
    html += '<div class="app-two app-home-actions"><button class="btn-secondary" onclick="BTHApp.go(\'updates\')">BTH Updates '+(unreadUpdateCount()?'<span class="button-badge">'+unreadUpdateCount()+'</span>':'')+'</button><button class="btn-secondary" onclick="BTHApp.go(\'settings\')">Theme & Motion</button></div>';
    html += '<div class="app-card"><div class="app-card-meta">Recommended</div><div class="app-card-title">'+appEsc(recommended.title)+'</div><div class="app-copy">'+appEsc(recommended.description)+'</div><button class="btn-secondary" onclick="BTHApp.go(\'library\')">View track</button></div>';
    if (updates.length) {
      html += '<div class="app-card"><div class="app-card-meta">Latest</div><div class="app-card-title">BTH Updates</div>'+updates.map(function(item){
        return '<div class="update-tease"><span>'+appEsc(item.tag || "Update")+'</span><strong>'+appEsc(item.title)+'</strong></div>';
      }).join("")+'<button class="btn-secondary" onclick="BTHApp.go(\'updates\')">Open updates</button></div>';
    }
    if (mode === "free") {
      html += '<div class="app-card"><div class="app-card-title">Start with the free reset</div><div class="app-copy">Five days. Hips, ankles, knees, core, then power. No fluff - just the reset work that gets your body moving right again.</div><button class="btn-primary" style="margin-top:12px;" onclick="BTHApp.go(\'reset\')">Open the reset</button></div>';
      html += '<div class="app-card why-rise"><div class="app-card-title">Why Rise</div><div class="app-copy">The full library, every track, new work each month - for less than one training session. Built to keep you hooping, not just dunking.</div><a class="btn-primary" href="'+GUMROAD_URL+'">Unlock the full library</a></div>';
      html += '<div class="app-card"><div class="app-card-title">Already bought BTH Rise?</div><div class="app-copy">Enter the license key from your Gumroad receipt and unlock the full library on this device.</div><button class="btn-secondary" onclick="BTHApp.go(\'account\')">Enter license key</button></div>';
      html += renderLockedPreview();
    } else {
      html += '<div class="app-two"><button class="btn-primary" onclick="BTHApp.go(\'library\')">Open Library</button><button class="btn-secondary" onclick="BTHApp.go(\'reset\')">Open Reset</button></div>';
      if (mode === "owner") html += '<div class="app-card"><div class="app-card-title">Owner tools</div><div class="app-copy">Ty-only operator tools are available behind owner mode.</div><button class="btn-primary" onclick="BTHApp.openOwner()">Open owner tools</button></div>';
    }
    return html;
  }

  function renderOnboarding(mode){
    if (appLoad("bth_intro_done", false)) return renderIntake();
    var copy = ONBOARDING_STEPS[tourIndex] || ONBOARDING_STEPS[0];
    return '<div class="onboarding-shell">'+
      appHero("Built to Hoop", "Stay Ready", ["Step "+(tourIndex+1)+" of "+ONBOARDING_STEPS.length])+
      '<div class="app-card cinematic-card"><div class="app-card-title">'+appEsc(copy)+'</div><div class="tour-progress">'+ONBOARDING_STEPS.map(function(_,i){return '<span class="'+(i===tourIndex?'active':'')+'"></span>';}).join("")+'</div><div class="app-two"><button class="btn-secondary" onclick="BTHApp.skipOnboarding()">Skip</button><button class="btn-primary" onclick="BTHApp.nextTour()">Next</button></div></div>'+
    '</div>';
  }

  function renderIntake(){
    var question = INTAKE_QUESTIONS[intakeIndex] || INTAKE_QUESTIONS[0];
    var intake = getIntake();
    var html = appHero("Set your app", "Answer quick. The Home screen starts moving around you.", ["Question "+(intakeIndex+1)+" of "+INTAKE_QUESTIONS.length]);
    html += '<div class="app-card"><label class="app-card-title" for="intake-input">'+appEsc(question.label)+'</label>';
    if (question.type === "text") {
      html += '<div class="input-stack"><input id="intake-input" class="app-input" autocomplete="given-name" value="'+appEsc(intake[question.id] || "")+'" placeholder="First name"><button class="btn-primary" onclick="BTHApp.saveTextAnswer()">Next</button></div>';
    } else {
      html += '<div class="choice-grid">'+(question.options || []).map(function(option){
        var active = intake[question.id] === option;
        return '<button type="button" class="choice-chip '+(active?'active':'')+'" onclick="BTHApp.saveChoiceAnswer(\''+appEsc(question.id)+'\', \''+appEsc(option).replace(/'/g, "\\'")+'\')">'+appEsc(option)+'</button>';
      }).join("")+'</div>';
    }
    html += '<div class="app-muted">Stored locally on this device. No account database in v1.</div></div>';
    return html;
  }

  function renderLockedPreview(){
    return '<div class="app-card"><div class="app-card-title">Locked library previews</div><div class="app-muted">Free mode shows the map. Members get the full cards.</div>'+BTH_LIBRARY.slice(0,4).map(function(program){
      return '<div class="locked-panel"><div class="app-card-title" style="font-size:16px;">'+appEsc(program.title)+'</div><div class="app-muted">'+appEsc(program.description)+'</div></div>';
    }).join("")+'<a class="btn-primary" style="display:block;text-align:center;text-decoration:none;margin-top:12px;" href="'+GUMROAD_URL+'">Upgrade to BTH Rise</a></div>';
  }

  function renderReset(){
    return appHero("Free 5-Day Reset", "The cold-traffic zone stays free. Give the body a reason to open the app before the paid library.", ["Free", "Days 1-5"]) +
      FREE_RESET.map(function(day){
        return '<div class="app-card"><div class="reset-day-number">Day '+day.day+' of 5</div><div class="app-card-title">'+appEsc(day.title)+'</div><div class="app-card-meta">'+appEsc(day.subtitle)+'</div>'+renderExercises(day.exercises)+'<div class="app-copy">'+appEsc(day.note)+'</div><a class="btn-secondary" style="display:block;text-align:center;text-decoration:none;" href="'+day.sourceUrl+'" target="_blank" rel="noopener">Open source PDF</a></div>';
      }).join("");
  }

  function renderLibrary(mode){
    var unlocked = isUnlocked();
    var query = librarySearch.trim().toLowerCase();
    var programs = BTH_LIBRARY.filter(function(program){
      if (!query) return true;
      return [program.title, program.description, program.id].join(" ").toLowerCase().indexOf(query) !== -1;
    });
    var continueTarget = getContinueTarget();
    var html = appHero("Train", unlocked ? "Full library access is on for this device." : "Preview the system. Unlock with your Gumroad license key.", [unlocked ? "Unlocked" : "Locked previews", "Search ready"]);
    html += '<div class="app-card train-control"><div class="app-card-meta">Resume</div><div class="app-card-title">'+appEsc(continueTarget.title)+'</div><div class="app-copy">'+appEsc(continueTarget.description)+'</div><div class="input-stack"><label class="sr-only" for="library-search-input">Search training library</label><input id="library-search-input" class="app-input" value="'+appEsc(librarySearch)+'" placeholder="Search Train" oninput="BTHApp.setLibrarySearch(this.value)"></div></div>';
    html += programs.map(function(program){
      var locked = !unlocked && program.tier === "member";
      var status = program.status === "available" ? "Available" : program.status === "partial" ? "Partial" : "TODO: content";
      var body = '<div class="app-card"><div class="app-card-title">'+appEsc(program.title)+'</div><div class="app-card-meta">'+appEsc(status)+' - '+appEsc(program.source)+'</div><div class="app-copy">'+appEsc(program.description)+'</div>';
      if (locked) {
        body += '<div class="locked-panel"><strong>Locked.</strong> Join BTH Rise or enter your Gumroad license key to open the full cards.<div class="app-copy"><strong>Why Rise:</strong> The full library, every track, new work each month - built to keep you hooping, not just dunking.</div></div>';
      } else {
        body += renderProgram(program);
      }
      body += '</div>';
      return body;
    }).join("");
    if (!unlocked) html += '<a class="btn-primary" style="display:block;text-align:center;text-decoration:none;" href="'+GUMROAD_URL+'">Join BTH Rise - $27/mo</a>';
    return html;
  }

  function renderProgram(program){
    var jumps = [];
    (program.phases || []).forEach(function(phase){
      (phase.weeks || []).forEach(function(week){
        (week.days || []).forEach(function(day){
          jumps.push({id:makeDayId(program.id, week.week, day.day), label:"W"+week.week+" D"+day.day});
        });
      });
    });
    return '<div class="program-block">'+(jumps.length?'<div class="program-jump" aria-label="Training day quick jump">'+jumps.map(function(jump){
      return '<button type="button" onclick="BTHApp.jumpDay(\''+appEsc(jump.id)+'\')">'+appEsc(jump.label)+'</button>';
    }).join("")+'</div>':'')+(program.phases||[]).map(function(phase){
      return '<div class="program-phase">'+appEsc(phase.title)+'</div>'+(phase.weeks||[]).map(function(week){
        return '<div class="week-block"><div class="day-title">Week '+appEsc(week.week)+' - '+appEsc(week.title)+'</div>'+(week.intent?'<div class="app-muted">'+appEsc(week.intent)+'</div>':'')+(week.days||[]).map(function(day){ return renderDay(day, program.id, week.week); }).join("")+'</div>';
      }).join("");
    }).join("")+'</div>';
  }

  function renderDay(day, programId, week){
    var dayId = makeDayId(programId, week, day.day);
    var done = isDayDone(dayId);
    return '<details class="day-block '+(done?'day-done':'')+'" id="'+appEsc(dayId)+'" '+(done?'':'open')+'><summary><span><span class="reset-day-number">Day '+appEsc(day.day)+'</span><span class="day-title">'+appEsc(day.title)+'</span></span><button type="button" class="day-done-btn" onclick="event.preventDefault(); BTHApp.toggleDayDone(\''+appEsc(dayId)+'\', \''+appEsc(programId)+'\', \''+appEsc(week)+'\', \''+appEsc(day.day)+'\')">'+(done?'Done':'Mark done')+'</button></summary><div class="app-muted">'+appEsc(day.focus || "")+'</div>'+renderExercises(day.exercises || [])+(day.finisher?'<div class="locked-panel"><strong>'+appEsc(day.finisher.title)+'</strong><div class="app-muted">'+appEsc(day.finisher.description)+' - '+appEsc(day.finisher.prescription)+'</div></div>':'')+'</details>';
  }

  function renderExercises(exercises){
    return (exercises || []).map(function(ex){
      var isTodo = /^TODO: content/.test(ex.name || "");
      var dose = ex.prescription || ((ex.sets || "") + (ex.reps ? " x " + ex.reps : ""));
      return '<div class="exercise-line '+(isTodo?'todo-content':'')+'"><div class="exercise-name">'+appEsc(ex.name)+'</div><div class="exercise-dose">'+appEsc(dose)+'</div>'+((ex.cues||[]).length?'<div class="app-muted">'+(ex.cues||[]).map(appEsc).join(" ")+'</div>':'')+(ex.videoUrl?'<a href="'+appEsc(ex.videoUrl)+'">Video</a>':'')+'</div>';
    }).join("");
  }

  function renderUpdates(){
    var updates = getUpdatesNewestFirst();
    var permission = "Notification" in window ? Notification.permission : "unsupported";
    var html = appHero("BTH Updates", "The in-app broadcast channel. New work, app notes, and BTH moves live here first.", ["BTH only", "Unread saved"]);
    html += '<div class="app-card"><div class="app-card-title">Reminders</div><div class="app-copy">'+appEsc(REMINDER_COPY.body)+'</div><div class="app-muted">Foreground reminders fire while the app is open or recently used. True background push needs a deeper backend later.</div>';
    if (permission === "granted") html += '<div class="app-success">Notifications are allowed on this device.</div>';
    else if (permission === "denied") html += '<div class="app-error">Notifications are blocked in this browser. You can still use the Updates feed.</div>';
    else if (permission === "unsupported") html += '<div class="app-muted">This browser does not support notifications.</div>';
    else html += '<button class="btn-secondary" onclick="BTHApp.requestNotifications()">Allow reminders</button>';
    html += '</div>';
    html += updates.map(function(item){
      return '<article class="app-card update-card '+(item.pinned?'pinned':'')+'"><div class="app-card-meta">'+appEsc(item.tag || "Update")+' - '+appEsc(item.date || "")+'</div><div class="app-card-title">'+appEsc(item.title)+'</div><div class="app-copy">'+appEsc(item.body)+'</div>'+(item.pinned?'<span class="app-pill">Pinned</span>':'')+'</article>';
    }).join("") || '<div class="app-card"><div class="app-card-title">No updates yet</div><div class="app-copy">When BTH has something worth saying, it will live here.</div></div>';
    return html;
  }

  function renderSettings(){
    var state = getAppState();
    var theme = getStoredTheme();
    var motion = getReducedMotion();
    var html = appHero("Settings", "Theme, motion, and first-run setup.", [theme === "dark" ? "Dark" : "Light", motion ? "Motion off" : "Motion on"]);
    html += '<div class="app-card"><div class="app-card-title">Theme</div><div class="segmented-control" role="group" aria-label="Theme"><button class="'+(theme==="light"?"active":"")+'" onclick="BTHApp.setTheme(\'light\')">Light</button><button class="'+(theme==="dark"?"active":"")+'" onclick="BTHApp.setTheme(\'dark\')">Dark</button></div></div>';
    html += '<div class="app-card"><div class="settings-row"><div><div class="app-card-title">Reduce motion</div><div class="app-muted">Kills cold-open motion, quick cuts, glows, and smooth scroll.</div></div><button class="toggle-btn '+(motion?'active':'')+'" aria-pressed="'+(motion?'true':'false')+'" onclick="BTHApp.setReduceMotion('+(!motion)+')">'+(motion?'On':'Off')+'</button></div></div>';
    html += '<div class="app-card"><div class="app-card-title">Personal setup</div><div class="app-copy">Run the walkthrough and intake again any time.</div><button class="btn-secondary" onclick="BTHApp.resetOnboarding()">Run setup again</button></div>';
    html += '<div class="app-card"><div class="app-card-title">Local state</div><div class="app-muted">Theme, intake, seen updates, reminders, and training progress are stored on this device only. Active training days use an operator-day id so a midnight rollover does not wipe a session.</div></div>';
    if (state.affiliateInterest || (state.notifyMe || []).length) {
      html += '<div class="app-card"><div class="app-card-title">Saved interest</div><div class="app-muted">'+(state.affiliateInterest?'Affiliate interest saved locally. ':'')+((state.notifyMe||[]).length?state.notifyMe.length+' drop notify request(s) saved locally.':'')+'</div></div>';
    }
    return html;
  }

  function renderAccount(mode){
    var access = appLoad("bth_member_access", null);
    var html = appHero("Access", "License key unlock, owner mode, and v1 limits.", [mode.toUpperCase()]);
    html += '<div class="app-card"><div class="app-card-title">Member unlock</div>';
    if (access) {
      html += '<div class="app-success">Member mode is active on this device. Verified '+appEsc(access.verifiedAt || "")+'.</div><button class="btn-secondary" onclick="BTHApp.clearMember()">Clear member access</button>';
    } else {
      html += '<div class="app-copy">Paste the license key from your Gumroad receipt.</div><div class="input-stack"><input id="license-key-input" class="app-input" autocomplete="off" placeholder="Gumroad license key"><button class="btn-primary" onclick="BTHApp.verifyLicense()">Unlock member mode</button><div id="license-result"></div></div>';
    }
    html += '</div>';
    html += '<div class="app-card"><div class="app-card-title">Owner mode</div><div class="app-copy">Ty-only tools are hidden unless owner mode is unlocked.</div><div class="input-stack"><input id="owner-key-input" class="app-input" type="password" autocomplete="off" placeholder="Owner passphrase"><button class="btn-secondary" onclick="BTHApp.unlockOwner()">Unlock owner mode</button><div id="owner-result"></div></div></div>';
    html += '<div class="app-card"><div class="app-card-title">V1 limits</div><div class="app-muted">Progress is stored in localStorage on this device only. License gating is client-side and can be bypassed by a technical user. No backend, no accounts database, no cross-device sync in v1.</div></div>';
    html += '<div class="app-card"><div class="app-card-title">Content gaps</div><div class="gap-list">'+CONTENT_GAPS.map(function(g){return '<div class="gap-item"><strong>'+appEsc(g.area)+'</strong><br>'+appEsc(g.gap)+'</div>';}).join("")+'</div></div>';
    return html;
  }

  function renderBthApp(){
    ensureAppShell();
    applyAppPrefs();
    document.body.classList.remove("mode-free","mode-member","mode-owner");
    var mode = getMode();
    document.body.classList.add("mode-" + mode);
    var root = document.getElementById("bth-app-root");
    if (currentScreen === "updates") markUpdatesSeen();
    renderNav(mode);
    if (currentScreen === "owner" && mode !== "owner") currentScreen = "account";
    if (shouldShowOnboarding()) root.innerHTML = renderOnboarding(mode);
    else if (currentScreen === "home") root.innerHTML = renderHome(mode);
    else if (currentScreen === "reset") root.innerHTML = renderReset();
    else if (currentScreen === "library") root.innerHTML = renderLibrary(mode);
    else if (currentScreen === "updates") root.innerHTML = renderUpdates();
    else if (currentScreen === "settings") root.innerHTML = renderSettings();
    else root.innerHTML = renderAccount(mode);
  }

  async function sha256(text){
    var data = new TextEncoder().encode(text);
    var hash = await crypto.subtle.digest("SHA-256", data);
    return Array.prototype.map.call(new Uint8Array(hash), function(b){ return b.toString(16).padStart(2, "0"); }).join("");
  }

  async function unlockOwner(){
    var input = document.getElementById("owner-key-input");
    var result = document.getElementById("owner-result");
    var value = (input && input.value || "").trim();
    if (!value) {
      result.innerHTML = '<div class="app-error">Enter the owner passphrase.</div>';
      return;
    }
    var digest = await sha256(value);
    if (digest === OWNER_HASH) {
      appSave("bth_owner_access", {unlockedAt:new Date().toISOString()});
      currentScreen = "home";
      renderBthApp();
    } else {
      result.innerHTML = '<div class="app-error">Owner key did not match.</div>';
    }
  }

  async function verifyLicense(){
    var input = document.getElementById("license-key-input");
    var result = document.getElementById("license-result");
    var key = (input && input.value || "").trim();
    if (!key) {
      result.innerHTML = '<div class="app-error">Enter the license key from your Gumroad receipt.</div>';
      return;
    }
    result.innerHTML = '<div class="app-muted">Checking Gumroad...</div>';
    try {
      var body = new URLSearchParams();
      body.set("product_id", PRODUCT_ID);
      body.set("license_key", key);
      body.set("increment_uses_count", "false");
      var response = await fetch("https://api.gumroad.com/v2/licenses/verify", {method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body:body.toString()});
      var data = await response.json();
      if (data && data.success) {
        appSave("bth_member_access", {
          verifiedAt:new Date().toISOString(),
          licenseLast4:key.slice(-4),
          productId:PRODUCT_ID,
          email:data.purchase && data.purchase.email ? data.purchase.email : ""
        });
        currentScreen = "home";
        renderBthApp();
      } else {
        result.innerHTML = '<div class="app-error">That key did not unlock BTH Rise. Check the receipt and try again.</div>';
      }
    } catch (e) {
      result.innerHTML = '<div class="app-error">Could not reach Gumroad from this browser. Check connection and try again.</div>';
    }
  }

  function clearMember(){
    appRemove("bth_member_access");
    appRemove("bth_owner_access");
    currentScreen = "home";
    renderBthApp();
  }

  function nextTour(){
    if (tourIndex < ONBOARDING_STEPS.length - 1) {
      tourIndex += 1;
      renderBthApp();
      return;
    }
    appSave("bth_intro_done", true);
    intakeIndex = 0;
    renderBthApp();
  }

  function skipOnboarding(){
    appSave("bth_intro_done", true);
    appSave("bth_onboarding_complete", true);
    appSave("bth_onboarding_done", true);
    currentScreen = "home";
    renderBthApp();
  }

  function saveTextAnswer(){
    var question = INTAKE_QUESTIONS[intakeIndex] || INTAKE_QUESTIONS[0];
    var input = document.getElementById("intake-input");
    var state = getAppState();
    state.intake = state.intake || {};
    state.intake[question.id] = (input && input.value || "").trim();
    saveAppState(state);
    nextIntake();
  }

  function saveChoiceAnswer(id, value){
    var state = getAppState();
    state.intake = state.intake || {};
    state.intake[id] = value;
    saveAppState(state);
    nextIntake();
  }

  function nextIntake(){
    if (intakeIndex < INTAKE_QUESTIONS.length - 1) {
      intakeIndex += 1;
      renderBthApp();
      return;
    }
    finishOnboarding();
  }

  function finishOnboarding(){
    appSave("bth_intro_done", true);
    appSave("bth_onboarding_complete", true);
    appSave("bth_onboarding_done", true);
    currentScreen = "home";
    renderBthApp();
  }

  function openOwnerTools(){
    if (getMode() !== "owner") {
      currentScreen = "account";
      renderBthApp();
      return;
    }
    document.body.classList.add("owner-tools-open");
    if (typeof renderToday === "function") renderToday();
  }

  function closeOwnerTools(){
    document.body.classList.remove("owner-tools-open");
    renderBthApp();
  }

  function initBthApp(){
    ensureAppShell();
    applyAppPrefs();
    renderBthApp();
    loadContent();
    registerServiceWorker();
    startReminderLoop();
    window.setTimeout(showColdOpen, 80);
  }

  window.BTHApp = {
    go:setScreen,
    verifyLicense:verifyLicense,
    unlockOwner:unlockOwner,
    clearMember:clearMember,
    finishOnboarding:finishOnboarding,
    nextTour:nextTour,
    skipOnboarding:skipOnboarding,
    saveTextAnswer:saveTextAnswer,
    saveChoiceAnswer:saveChoiceAnswer,
    resetOnboarding:resetOnboarding,
    setTheme:setTheme,
    setReduceMotion:setReduceMotion,
    requestNotifications:requestNotificationPermission,
    setLibrarySearch:setLibrarySearch,
    jumpDay:jumpDay,
    toggleDayDone:toggleDayDone,
    openOwner:openOwnerTools,
    closeOwner:closeOwnerTools,
    gaps:CONTENT_GAPS,
    library:BTH_LIBRARY,
    reset:FREE_RESET
  };

  initBthApp();
})();

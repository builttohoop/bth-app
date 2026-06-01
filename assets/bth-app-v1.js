(function(){
  var OWNER_HASH = "660b53b077707bd7221f880993431e1b1ef0cb4ff7670320a169c6a068817f62";
  var PRODUCT_PERMALINK = "thxqs";
  var GUMROAD_URL = "https://builttohoop.gumroad.com/l/thxqs";
  var currentScreen = "home";

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
    var items = [
      ["home","Home","BTH"],
      ["reset","Reset","5"],
      ["library","Library","LIB"],
      ["account","Access","KEY"]
    ];
    if (mode === "owner") items.push(["owner","Owner","TY"]);
    nav.innerHTML = items.map(function(item){
      return '<button class="app-nav-btn '+(currentScreen===item[0]?'active':'')+'" data-screen="'+item[0]+'"><span class="app-nav-icon">'+item[2]+'</span><span class="app-nav-label">'+item[1]+'</span></button>';
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
    var html = appHero("The App Becomes the Home", "Train, reset, unlock the library, and keep your body ready to hoop without breaking down.", [mode.toUpperCase(), "Text-first v1", "Local progress"]);
    if (mode === "free") {
      html += '<div class="app-card"><div class="app-card-title">Start with the free reset</div><div class="app-copy">Five days. Hips, ankles, knees, core, then power. No fluff - just the reset work that gets your body moving right again.</div><button class="btn-primary" style="margin-top:12px;" onclick="BTHApp.go(\'reset\')">Open the reset</button></div>';
      html += '<div class="app-card"><div class="app-card-title">Already bought BTH Rise?</div><div class="app-copy">Enter the license key from your Gumroad receipt and unlock the full library on this device.</div><button class="btn-secondary" onclick="BTHApp.go(\'account\')">Enter license key</button></div>';
      html += renderLockedPreview();
    } else {
      html += renderOnboarding(mode);
      html += '<div class="app-two"><button class="btn-primary" onclick="BTHApp.go(\'library\')">Open Library</button><button class="btn-secondary" onclick="BTHApp.go(\'reset\')">Open Reset</button></div>';
      if (mode === "owner") html += '<div class="app-card"><div class="app-card-title">Owner tools</div><div class="app-copy">Ty-only operator tools are available behind owner mode.</div><button class="btn-primary" onclick="BTHApp.openOwner()">Open owner tools</button></div>';
    }
    return html;
  }

  function renderOnboarding(mode){
    if (appLoad("bth_onboarding_done", false)) {
      return '<div class="app-card"><div class="app-card-title">You are in</div><div class="app-copy">Your library is unlocked. Start with Foundation Month, then move into the performance track once the base is built.</div></div>';
    }
    var steps = [
      ["Welcome in", "BTH is built around the way pickup actually loads your body. Restore first. Rebuild next. Then rise."],
      ["How the library works", "Foundation Month starts with Restore weeks 1-2 and Rebuild weeks 3-4. Add-ons sit beside the main path."],
      ["Start Day 1", "Do not skip the base. Your job is to stack clean days and keep coming back."]
    ];
    return '<div class="app-card"><div class="app-card-title">Member onboarding</div><div class="app-card-meta">First run</div>'+steps.map(function(step,i){
      return '<div class="day-block"><div class="reset-day-number">0'+(i+1)+'</div><div class="day-title">'+appEsc(step[0])+'</div><div class="app-muted">'+appEsc(step[1])+'</div></div>';
    }).join("")+'<button class="btn-primary" onclick="BTHApp.finishOnboarding()">Start Day 1</button></div>';
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
    var html = appHero("BTH Library", unlocked ? "Full library access is on for this device." : "Preview the system. Unlock with your Gumroad license key.", [unlocked ? "Unlocked" : "Locked previews", "videoUrl ready"]);
    html += BTH_LIBRARY.map(function(program){
      var locked = !unlocked && program.tier === "member";
      var status = program.status === "available" ? "Available" : program.status === "partial" ? "Partial" : "TODO: content";
      var body = '<div class="app-card"><div class="app-card-title">'+appEsc(program.title)+'</div><div class="app-card-meta">'+appEsc(status)+' - '+appEsc(program.source)+'</div><div class="app-copy">'+appEsc(program.description)+'</div>';
      if (locked) {
        body += '<div class="locked-panel"><strong>Locked.</strong> Join BTH Rise or enter your Gumroad license key to open the full cards.</div>';
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
    return '<div class="program-block">'+(program.phases||[]).map(function(phase){
      return '<div class="program-phase">'+appEsc(phase.title)+'</div>'+(phase.weeks||[]).map(function(week){
        return '<div class="day-block"><div class="day-title">Week '+appEsc(week.week)+' - '+appEsc(week.title)+'</div>'+(week.intent?'<div class="app-muted">'+appEsc(week.intent)+'</div>':'')+(week.days||[]).map(renderDay).join("")+'</div>';
      }).join("");
    }).join("")+'</div>';
  }

  function renderDay(day){
    return '<div class="day-block"><div class="reset-day-number">Day '+appEsc(day.day)+'</div><div class="day-title">'+appEsc(day.title)+'</div><div class="app-muted">'+appEsc(day.focus || "")+'</div>'+renderExercises(day.exercises || [])+(day.finisher?'<div class="locked-panel"><strong>'+appEsc(day.finisher.title)+'</strong><div class="app-muted">'+appEsc(day.finisher.description)+' - '+appEsc(day.finisher.prescription)+'</div></div>':'')+'</div>';
  }

  function renderExercises(exercises){
    return (exercises || []).map(function(ex){
      var isTodo = /^TODO: content/.test(ex.name || "");
      var dose = ex.prescription || ((ex.sets || "") + (ex.reps ? " x " + ex.reps : ""));
      return '<div class="exercise-line '+(isTodo?'todo-content':'')+'"><div class="exercise-name">'+appEsc(ex.name)+'</div><div class="exercise-dose">'+appEsc(dose)+'</div>'+((ex.cues||[]).length?'<div class="app-muted">'+(ex.cues||[]).map(appEsc).join(" ")+'</div>':'')+(ex.videoUrl?'<a href="'+appEsc(ex.videoUrl)+'">Video</a>':'')+'</div>';
    }).join("");
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
    document.body.classList.remove("mode-free","mode-member","mode-owner");
    var mode = getMode();
    document.body.classList.add("mode-" + mode);
    var root = document.getElementById("bth-app-root");
    renderNav(mode);
    if (currentScreen === "owner" && mode !== "owner") currentScreen = "account";
    if (currentScreen === "home") root.innerHTML = renderHome(mode);
    else if (currentScreen === "reset") root.innerHTML = renderReset();
    else if (currentScreen === "library") root.innerHTML = renderLibrary(mode);
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
      body.set("product_permalink", PRODUCT_PERMALINK);
      body.set("license_key", key);
      body.set("increment_uses_count", "false");
      var response = await fetch("https://api.gumroad.com/v2/licenses/verify", {method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body:body.toString()});
      var data = await response.json();
      if (data && data.success) {
        appSave("bth_member_access", {
          verifiedAt:new Date().toISOString(),
          licenseLast4:key.slice(-4),
          productPermalink:PRODUCT_PERMALINK,
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

  function finishOnboarding(){
    appSave("bth_onboarding_done", true);
    currentScreen = "library";
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
    renderBthApp();
  }

  window.BTHApp = {
    go:setScreen,
    verifyLicense:verifyLicense,
    unlockOwner:unlockOwner,
    clearMember:clearMember,
    finishOnboarding:finishOnboarding,
    openOwner:openOwnerTools,
    closeOwner:closeOwnerTools,
    gaps:CONTENT_GAPS,
    library:BTH_LIBRARY,
    reset:FREE_RESET
  };

  initBthApp();
})();

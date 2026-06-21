/*
 * Polaris Experience Library + Discovery Questions
 * ------------------------------------------------
 * Experiences are the "Experience Layer" of the Knowledge Graph (Book 3).
 * Every experience follows the Methodology governance (Book 5): it must define
 * target competencies, expected behaviours, evidence prompts, reflection prompts
 * and follow-up experiences. No experience exists without a developmental purpose.
 */
(function (P) {
  "use strict";

  P.EXPERIENCE_CATEGORIES = [
    { id: "home", name: "Home Activities", icon: "fa-house" },
    { id: "outdoor", name: "Outdoor Adventures", icon: "fa-tree" },
    { id: "creative", name: "Creative Projects", icon: "fa-paintbrush" },
    { id: "stem", name: "STEM Challenges", icon: "fa-flask" },
    { id: "community", name: "Community & Kindness", icon: "fa-hands-holding-child" },
    { id: "sports", name: "Sports & Movement", icon: "fa-medal" },
    { id: "family", name: "Family Rituals", icon: "fa-mug-hot" },
    { id: "venture", name: "Entrepreneurship", icon: "fa-store" },
  ];

  // difficulty maps to the Methodology zones: comfort -> learning -> growth
  P.EXPERIENCES = [
    {
      id: "exp_story_night", title: "Family Story Night", category: "family", icon: "fa-book-open",
      ageMin: 3, ageMax: 12, durationMin: 30, difficulty: "comfort",
      targets: ["expression", "public_speaking", "creative_thinking"],
      why: "A low-pressure stage helps your child practise telling a story with a clear beginning, middle and end.",
      steps: [
        "Pick a theme together (the funniest day, an imaginary world).",
        "Each family member tells a 2-minute story.",
        "Listen warmly — no corrections, only curiosity.",
      ],
      evidencePrompts: ["Record a short video or voice note of the story.", "Note one new word or idea they used."],
      reflectionPrompts: ["Which part of your story did you like most?", "What story would you tell next time?"],
      followUps: ["exp_mini_talk", "exp_comic"],
    },
    {
      id: "exp_mini_talk", title: "Mini TED Talk", category: "home", icon: "fa-microphone-lines",
      ageMin: 7, ageMax: 18, durationMin: 20, difficulty: "growth",
      targets: ["public_speaking", "self_confidence", "expression"],
      why: "Presenting a topic they love builds the courage to speak up — a strength that multiplies all others.",
      steps: [
        "Choose a topic they're passionate about.",
        "Prepare 3 simple points and one fun fact.",
        "Present to the family; applaud the effort.",
      ],
      evidencePrompts: ["Film the talk to watch back kindly.", "Note how they handled nerves."],
      reflectionPrompts: ["What went well in your talk?", "What would you add next time?"],
      followUps: ["exp_debate_dinner"],
    },
    {
      id: "exp_kindness_mission", title: "Secret Kindness Mission", category: "community", icon: "fa-gift",
      ageMin: 4, ageMax: 16, durationMin: 25, difficulty: "learning",
      targets: ["kindness", "empathy", "courage"],
      why: "Doing good for someone — anonymously — connects action to the warm feeling of contribution.",
      steps: [
        "Choose someone to help in secret.",
        "Plan a small kind act (a note, a chore, a gift).",
        "Carry it out without taking credit.",
      ],
      evidencePrompts: ["Snap a (respectful) photo of the kind act.", "Write down how it felt afterwards."],
      reflectionPrompts: ["How did helping make you feel?", "Who else could you surprise with kindness?"],
      followUps: ["exp_community_clean"],
    },
    {
      id: "exp_recycle_build", title: "Recycled Invention Lab", category: "stem", icon: "fa-robot",
      ageMin: 5, ageMax: 14, durationMin: 45, difficulty: "growth",
      targets: ["creative_thinking", "making", "problem_solving"],
      why: "Turning 'junk' into an invention strengthens creativity and persistence at the same time.",
      steps: [
        "Gather recycled materials (boxes, caps, string).",
        "Invent something that solves a tiny problem.",
        "Test it, then improve one thing.",
      ],
      evidencePrompts: ["Photograph the invention.", "Note what they changed to improve it."],
      reflectionPrompts: ["What problem does your invention solve?", "What would version 2 look like?"],
      followUps: ["exp_science_quest"],
    },
    {
      id: "exp_science_quest", title: "Kitchen Science Quest", category: "stem", icon: "fa-flask",
      ageMin: 5, ageMax: 13, durationMin: 35, difficulty: "learning",
      targets: ["curiosity", "critical_thinking", "focus"],
      why: "A hands-on experiment turns 'why?' into a habit of testing ideas.",
      steps: [
        "Pick a safe experiment (baking soda volcano, density jar).",
        "Predict what will happen first.",
        "Observe and compare to the prediction.",
      ],
      evidencePrompts: ["Photo or video of the experiment.", "Write the prediction vs. result."],
      reflectionPrompts: ["What surprised you?", "What would you test next?"],
      followUps: ["exp_recycle_build"],
    },
    {
      id: "exp_team_cook", title: "Cook as a Team", category: "home", icon: "fa-utensils",
      ageMin: 4, ageMax: 16, durationMin: 50, difficulty: "learning",
      targets: ["teamwork", "responsibility", "healthy_habits"],
      why: "A shared recipe teaches cooperation, planning and healthy choices in one delicious activity.",
      steps: [
        "Choose a healthy recipe together.",
        "Assign roles (chopper, mixer, plater).",
        "Cook, then enjoy and clean up as a team.",
      ],
      evidencePrompts: ["Photo of the finished dish.", "Note how they handled their role."],
      reflectionPrompts: ["What was your job, and how did it go?", "What would the team do differently?"],
      followUps: ["exp_plan_outing"],
    },
    {
      id: "exp_nature_explore", title: "Nature Explorer Walk", category: "outdoor", icon: "fa-binoculars",
      ageMin: 3, ageMax: 12, durationMin: 40, difficulty: "comfort",
      targets: ["curiosity", "physical_activity", "creative_thinking"],
      why: "Open-ended outdoor time fuels wonder, movement and noticing — all at once.",
      steps: [
        "Head outside with a 'wonder list' of things to find.",
        "Collect, observe and ask questions.",
        "Pick a favourite discovery to learn more about.",
      ],
      evidencePrompts: ["Photograph a discovery.", "Note a question they asked."],
      reflectionPrompts: ["What was the most interesting thing you found?", "What do you want to learn more about?"],
      followUps: ["exp_science_quest"],
    },
    {
      id: "exp_comic", title: "Create a Comic", category: "creative", icon: "fa-pen-ruler",
      ageMin: 6, ageMax: 15, durationMin: 45, difficulty: "learning",
      targets: ["creative_thinking", "making", "expression"],
      why: "A comic combines storytelling and making — a complete creative loop with a finished result.",
      steps: [
        "Invent a character and a small problem.",
        "Draw 4–6 panels with a beginning and end.",
        "Share it and tell the story aloud.",
      ],
      evidencePrompts: ["Photograph the finished comic.", "Note the story idea."],
      reflectionPrompts: ["What's your character like?", "What happens in the sequel?"],
      followUps: ["exp_mini_talk"],
    },
    {
      id: "exp_plan_outing", title: "Plan a Family Outing", category: "family", icon: "fa-map-location-dot",
      ageMin: 8, ageMax: 18, durationMin: 30, difficulty: "growth",
      targets: ["leadership", "organisation", "responsibility"],
      why: "Owning a real plan — budget, timing, logistics — builds leadership and organisation with genuine stakes.",
      steps: [
        "Hand your child the plan for a small outing.",
        "They decide where, when and the simple budget.",
        "Support, but let them lead the decisions.",
      ],
      evidencePrompts: ["Save their plan or checklist.", "Note a decision they made well."],
      reflectionPrompts: ["What did you plan, and how did it go?", "What would you organise differently?"],
      followUps: ["exp_micro_business"],
    },
    {
      id: "exp_micro_business", title: "Weekend Micro-Business", category: "venture", icon: "fa-store",
      ageMin: 9, ageMax: 18, durationMin: 90, difficulty: "growth",
      targets: ["entrepreneurship", "leadership", "problem_solving"],
      why: "A tiny real venture — a stall, a service — turns ideas into action and teaches resilience through real feedback.",
      steps: [
        "Brainstorm a simple product or service.",
        "Plan, make and 'sell' (even to family).",
        "Review what worked and what to improve.",
      ],
      evidencePrompts: ["Photo of the venture in action.", "Note one lesson learned."],
      reflectionPrompts: ["What did customers love?", "What would you change next time?"],
      followUps: ["exp_plan_outing"],
    },
    {
      id: "exp_community_clean", title: "Neighbourhood Clean-Up", category: "community", icon: "fa-broom",
      ageMin: 5, ageMax: 18, durationMin: 60, difficulty: "learning",
      targets: ["kindness", "responsibility", "teamwork"],
      why: "Caring for a shared space connects effort to community pride and belonging.",
      steps: [
        "Pick a small area to care for.",
        "Gather supplies and clean together safely.",
        "Talk about the difference you made.",
      ],
      evidencePrompts: ["Before/after photo.", "Note how they contributed."],
      reflectionPrompts: ["What difference did you make?", "What else could you care for?"],
      followUps: ["exp_kindness_mission"],
    },
    {
      id: "exp_calm_corner", title: "Build a Calm Corner", category: "home", icon: "fa-spa",
      ageMin: 4, ageMax: 12, durationMin: 30, difficulty: "comfort",
      targets: ["emotional_regulation", "self_confidence", "creative_thinking"],
      why: "Co-creating a calm space gives your child tools to name and manage big feelings.",
      steps: [
        "Choose a cosy spot together.",
        "Add calming tools (cushions, a feelings chart, a breathing card).",
        "Practise using it when calm, so it's ready when needed.",
      ],
      evidencePrompts: ["Photo of the calm corner.", "Note a feeling they named this week."],
      reflectionPrompts: ["What helps you feel calm?", "When could the calm corner help?"],
      followUps: ["exp_gratitude"],
    },
    {
      id: "exp_gratitude", title: "Gratitude Ritual", category: "family", icon: "fa-heart-circle-check",
      ageMin: 4, ageMax: 18, durationMin: 10, difficulty: "comfort",
      targets: ["emotional_regulation", "empathy", "kindness"],
      why: "A daily 'three good things' habit builds optimism, reflection and emotional wellbeing over time.",
      steps: [
        "Each evening, share three good things from the day.",
        "Include one thing someone else did.",
        "Keep it short and warm.",
      ],
      evidencePrompts: ["Keep a small gratitude journal.", "Note a recurring thing they appreciate."],
      reflectionPrompts: ["What are you grateful for today?", "Who made your day better?"],
      followUps: ["exp_calm_corner"],
    },
    {
      id: "exp_debate_dinner", title: "Friendly Dinner Debate", category: "family", icon: "fa-comments",
      ageMin: 9, ageMax: 18, durationMin: 25, difficulty: "growth",
      targets: ["critical_thinking", "expression", "courage"],
      why: "Debating a fun question teaches reasoning, listening and sharing a view with confidence.",
      steps: [
        "Pick a light question (Are cats or dogs better leaders?).",
        "Each side gives reasons; then swap sides.",
        "Celebrate the best argument, not the 'winner'.",
      ],
      evidencePrompts: ["Note a strong reason they gave.", "Voice note of a key point."],
      reflectionPrompts: ["What was your best reason?", "Did anyone change your mind, and why?"],
      followUps: ["exp_mini_talk"],
    },
    {
      id: "exp_skill_streak", title: "7-Day Skill Streak", category: "sports", icon: "fa-stopwatch",
      ageMin: 6, ageMax: 18, durationMin: 15, difficulty: "growth",
      targets: ["physical_activity", "resilience", "focus"],
      why: "Practising one physical skill daily for a week shows how persistence creates visible progress.",
      steps: [
        "Choose one skill (skipping, dribbling, balance).",
        "Practise 10–15 minutes daily for 7 days.",
        "Track tiny improvements each day.",
      ],
      evidencePrompts: ["Day-1 vs day-7 video.", "Note the progress they noticed."],
      reflectionPrompts: ["How did you improve over the week?", "What kept you going?"],
      followUps: ["exp_team_sport"],
    },
    {
      id: "exp_team_sport", title: "Join a Team Game", category: "sports", icon: "fa-people-group",
      ageMin: 5, ageMax: 18, durationMin: 60, difficulty: "learning",
      targets: ["teamwork", "physical_activity", "leadership"],
      why: "Team play teaches cooperation, communication and handling both winning and losing gracefully.",
      steps: [
        "Organise or join a friendly team game.",
        "Encourage passing, cheering and fair play.",
        "Talk about teamwork afterwards.",
      ],
      evidencePrompts: ["Photo or video of the game.", "Note a moment of teamwork."],
      reflectionPrompts: ["How did you help your team?", "How did you handle the result?"],
      followUps: ["exp_skill_streak"],
    },
    {
      id: "exp_journal", title: "Reflection Journal", category: "home", icon: "fa-pen-nib",
      ageMin: 7, ageMax: 18, durationMin: 10, difficulty: "comfort",
      targets: ["learning_agility", "emotional_regulation", "expression"],
      why: "A short daily reflection turns experiences into self-awareness — the heart of the Growth Loop.",
      steps: [
        "Each day, write or draw about one moment.",
        "Use a prompt: proud / tricky / surprised.",
        "Read back at week's end to spot growth.",
      ],
      evidencePrompts: ["Photo of a journal page.", "Note a recurring theme."],
      reflectionPrompts: ["What did you learn about yourself this week?", "What pattern do you notice?"],
      followUps: ["exp_gratitude"],
    },
    {
      id: "exp_grandparent", title: "Interview a Grandparent", category: "community", icon: "fa-user-clock",
      ageMin: 6, ageMax: 18, durationMin: 40, difficulty: "learning",
      targets: ["expression", "empathy", "curiosity"],
      why: "Interviewing an elder builds questioning, listening and connection across generations.",
      steps: [
        "Prepare 5 curious questions together.",
        "Record the conversation (with permission).",
        "Share a favourite story learned.",
      ],
      evidencePrompts: ["Voice note of the interview.", "Note a surprising answer."],
      reflectionPrompts: ["What surprised you most?", "What would you ask next time?"],
      followUps: ["exp_journal"],
    },
  ];

  P.experienceById = {};
  P.EXPERIENCES.forEach(function (e) { P.experienceById[e.id] = e; });

  P.experienceCategoryById = {};
  P.EXPERIENCE_CATEGORIES.forEach(function (c) { P.experienceCategoryById[c.id] = c; });

  P.DIFFICULTY = {
    comfort: { label: "Comfort Zone", color: "#3fc7a8" },
    learning: { label: "Learning Zone", color: "#f0a030" },
    growth: { label: "Growth Zone", color: "#9b6dff" },
  };

  /*
   * Discovery questions (Book 6 PAE — Discovery Assessment).
   * These feel like a conversation, not a test. They set interests, personality
   * and seed gentle initial signals into the Knowledge Graph.
   */
  P.DISCOVERY = {
    interests: [
      { id: "science", label: "Science & how things work", icon: "fa-atom", competencies: ["curiosity", "critical_thinking"] },
      { id: "art", label: "Art & making things", icon: "fa-palette", competencies: ["making", "creative_thinking"] },
      { id: "sports", label: "Sports & movement", icon: "fa-futbol", competencies: ["physical_activity", "teamwork"] },
      { id: "stories", label: "Stories & reading", icon: "fa-book", competencies: ["expression", "creative_thinking"] },
      { id: "music", label: "Music & performing", icon: "fa-music", competencies: ["making", "self_confidence"] },
      { id: "nature", label: "Animals & nature", icon: "fa-leaf", competencies: ["curiosity", "kindness"] },
      { id: "building", label: "Building & technology", icon: "fa-screwdriver-wrench", competencies: ["problem_solving", "making"] },
      { id: "helping", label: "Helping others", icon: "fa-hands-holding-heart", competencies: ["kindness", "empathy"] },
      { id: "leading", label: "Organising & leading", icon: "fa-flag", competencies: ["leadership", "organisation"] },
      { id: "puzzles", label: "Puzzles & games", icon: "fa-puzzle-piece", competencies: ["critical_thinking", "focus"] },
    ],
    personality: [
      { id: "independent", label: "Independent", pair: "collaborative" },
      { id: "collaborative", label: "Collaborative", pair: "independent" },
      { id: "reflective", label: "Reflective", pair: "adventurous" },
      { id: "adventurous", label: "Adventurous", pair: "reflective" },
      { id: "organized", label: "Organised", pair: "spontaneous" },
      { id: "spontaneous", label: "Spontaneous", pair: "organized" },
    ],
    goals: [
      { id: "confidence", label: "Build confidence", competencies: ["self_confidence", "public_speaking"] },
      { id: "social", label: "Make friends & connect", competencies: ["empathy", "teamwork"] },
      { id: "focus", label: "Improve focus", competencies: ["focus", "organisation"] },
      { id: "creativity", label: "Grow creativity", competencies: ["creative_thinking", "making"] },
      { id: "resilience", label: "Handle setbacks", competencies: ["resilience", "emotional_regulation"] },
      { id: "curiosity", label: "Love of learning", competencies: ["curiosity", "learning_agility"] },
      { id: "kindness", label: "Kindness & character", competencies: ["kindness", "integrity"] },
      { id: "leadership", label: "Leadership", competencies: ["leadership", "courage"] },
    ],
    // Situational discovery questions — each answer adds a gentle initial observation.
    questions: [
      {
        id: "q_newplace", text: "When your child enters a new place or situation, they usually…",
        options: [
          { label: "Dive right in to explore", competency: "courage", note: "Dives into new situations to explore" },
          { label: "Watch first, then join", competency: "critical_thinking", note: "Observes carefully before acting" },
          { label: "Look for a friend to join", competency: "empathy", note: "Seeks connection in new settings" },
        ],
      },
      {
        id: "q_stuck", text: "When something is hard or frustrating, your child tends to…",
        options: [
          { label: "Keep trying different ways", competency: "resilience", note: "Persists through frustration" },
          { label: "Ask for help", competency: "expression", note: "Asks for help when needed" },
          { label: "Take a break and return", competency: "emotional_regulation", note: "Self-regulates by taking a break" },
        ],
      },
      {
        id: "q_freetime", text: "Given free time, your child most often chooses to…",
        options: [
          { label: "Build, draw or make something", competency: "making", note: "Chooses to make and build" },
          { label: "Move, play or be active", competency: "physical_activity", note: "Chooses active play" },
          { label: "Read, imagine or daydream", competency: "creative_thinking", note: "Chooses imaginative play" },
        ],
      },
      {
        id: "q_group", text: "In a group of children, your child is most likely to…",
        options: [
          { label: "Suggest what to do", competency: "leadership", note: "Naturally suggests group direction" },
          { label: "Help everyone get along", competency: "teamwork", note: "Helps the group cooperate" },
          { label: "Notice who's left out", competency: "empathy", note: "Notices and includes others" },
        ],
      },
    ],
  };
})(window.Polaris = window.Polaris || {});

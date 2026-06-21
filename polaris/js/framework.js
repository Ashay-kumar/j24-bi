/*
 * Polaris Development Framework
 * --------------------------------
 * Implements the Polaris Development Standard (Book 4) + Development Atlas (Book 6).
 * Structure: Pillar -> Competency -> Observable Behaviors -> Evidence -> Growth Stage.
 *
 * This is the canonical "Development Layer" of the Polaris Knowledge Graph.
 * Every observation, insight and recommendation in the product references this data.
 */
(function (P) {
  "use strict";

  // The five developmental growth stages used across Polaris (never numeric scores).
  // Book 6 — "The Atlas avoids numerical scoring."
  P.GROWTH_STAGES = [
    { id: "emerging", label: "Emerging", order: 0, blurb: "First signs are beginning to show." },
    { id: "developing", label: "Developing", order: 1, blurb: "Appearing more often, with support." },
    { id: "consistent", label: "Consistent", order: 2, blurb: "Shows up reliably across situations." },
    { id: "advanced", label: "Advanced", order: 3, blurb: "Strong and self-directed." },
    { id: "inspiring", label: "Inspiring Others", order: 4, blurb: "Lifts and guides those around them." },
  ];

  // The Polaris Confidence Model (Book 7, Book 3). Confidence grows gradually with evidence.
  P.CONFIDENCE_LEVELS = [
    { id: "very_low", label: "Very Low", order: 0, min: 0.0 },
    { id: "low", label: "Low", order: 1, min: 0.18 },
    { id: "moderate", label: "Moderate", order: 2, min: 0.42 },
    { id: "high", label: "High", order: 3, min: 0.68 },
    { id: "very_high", label: "Very High", order: 4, min: 0.86 },
  ];

  // The ten Development Pillars (Book 4 / Book 6). These remain stable.
  P.PILLARS = [
    { id: "thinking", name: "Thinking", icon: "fa-lightbulb", color: "#4f7cff", blurb: "Curiosity, reasoning and problem solving." },
    { id: "emotional", name: "Emotional Wellbeing", icon: "fa-heart", color: "#f07a8c", blurb: "Understanding and caring for one's inner world." },
    { id: "relationships", name: "Relationships", icon: "fa-people-group", color: "#f0a030", blurb: "Connecting, collaborating and caring for others." },
    { id: "communication", name: "Communication", icon: "fa-comments", color: "#20c8c0", blurb: "Expressing ideas with clarity and confidence." },
    { id: "creativity", name: "Creativity", icon: "fa-palette", color: "#9b6dff", blurb: "Imagining, making and reinventing." },
    { id: "character", name: "Character", icon: "fa-shield-heart", color: "#22c27a", blurb: "Honesty, courage and doing what is right." },
    { id: "effectiveness", name: "Personal Effectiveness", icon: "fa-bullseye", color: "#5aa9e6", blurb: "Focus, organisation and follow-through." },
    { id: "health", name: "Health & Physical", icon: "fa-person-running", color: "#3fc7a8", blurb: "Movement, energy and healthy habits." },
    { id: "future", name: "Future Readiness", icon: "fa-compass", color: "#c79a3f", blurb: "Adaptability, learning agility and ambition." },
    { id: "purpose", name: "Purpose & Contribution", icon: "fa-seedling", color: "#7bbf5a", blurb: "Meaning, service and giving back." },
  ];

  /*
   * Competencies — a curated MVP set across all ten pillars (Book 13 roadmap: "20 Core Competencies").
   * Each follows the Atlas competency record: definition, why it matters, observable behaviors,
   * parent observation prompts, child reflection prompts, accepted evidence, coaching, relationships.
   */
  P.COMPETENCIES = [
    // ---------------- Thinking ----------------
    {
      id: "curiosity", pillar: "thinking", name: "Curiosity", icon: "fa-magnifying-glass",
      definition: "The drive to explore, question and understand how the world works.",
      why: "Curiosity is the engine of lifelong learning. Curious children ask better questions and keep growing long after school ends.",
      behaviors: [
        "Asks thoughtful follow-up questions",
        "Explores unfamiliar objects or ideas without being asked",
        "Experiments to see what happens",
        "Connects new ideas to things they already know",
      ],
      parentPrompts: [
        "Has your child explored something new recently without being asked?",
        "Does your child ask 'why' and 'how' questions?",
      ],
      reflectionPrompts: ["What surprised you today?", "What would you love to learn more about?"],
      evidenceTypes: ["observation", "photo", "project", "voice"],
      coaching: ["Keep a 'wonder jar' for questions to explore together on weekends.", "Answer a question with a question: 'What do you think?'"],
      related: ["critical_thinking", "creative_thinking"],
    },
    {
      id: "critical_thinking", pillar: "thinking", name: "Critical Thinking", icon: "fa-diagram-project",
      definition: "Reasoning through problems, weighing options and reaching sound conclusions.",
      why: "Critical thinking helps children make good decisions and resist misinformation throughout life.",
      behaviors: [
        "Breaks a problem into smaller parts",
        "Compares options before deciding",
        "Explains the reasoning behind a choice",
        "Notices when something doesn't add up",
      ],
      parentPrompts: ["Did your child solve a problem on their own this week?", "Can your child explain why they made a choice?"],
      reflectionPrompts: ["What was tricky, and how did you figure it out?", "What would you try differently next time?"],
      evidenceTypes: ["observation", "project", "journal"],
      coaching: ["Cook a recipe together and let them adjust it.", "Play strategy games like chess or Set."],
      related: ["curiosity", "problem_solving"],
    },
    {
      id: "problem_solving", pillar: "thinking", name: "Problem Solving", icon: "fa-puzzle-piece",
      definition: "Finding workable solutions to real challenges, big and small.",
      why: "Children who can solve problems feel capable and approach obstacles with confidence rather than avoidance.",
      behaviors: [
        "Tries more than one approach when stuck",
        "Stays with a challenge instead of giving up",
        "Uses available resources creatively",
        "Reflects on what worked",
      ],
      parentPrompts: ["Did your child work through a frustration without giving up?", "Did they fix or build something themselves?"],
      reflectionPrompts: ["What problem did you solve today?", "Who or what helped you figure it out?"],
      evidenceTypes: ["observation", "photo", "project", "video"],
      coaching: ["Resist rescuing too quickly — offer a hint, not the answer.", "Celebrate the attempt, not just the success."],
      related: ["critical_thinking", "resilience"],
    },

    // ---------------- Emotional Wellbeing ----------------
    {
      id: "emotional_regulation", pillar: "emotional", name: "Emotional Regulation", icon: "fa-wind",
      definition: "Noticing, naming and managing feelings in healthy ways.",
      why: "Emotional regulation underpins focus, friendships and resilience — and predicts wellbeing more than IQ.",
      behaviors: [
        "Names what they are feeling",
        "Calms down using a strategy (breathing, a break)",
        "Recovers after disappointment",
        "Asks for help when overwhelmed",
      ],
      parentPrompts: ["Did your child calm themselves after being upset?", "Could your child name a feeling this week?"],
      reflectionPrompts: ["What made you feel big feelings today?", "What helps you feel calm again?"],
      evidenceTypes: ["observation", "journal", "voice"],
      coaching: ["Name feelings out loud: 'You seem frustrated.'", "Create a calm-down corner with simple tools."],
      related: ["resilience", "empathy"],
    },
    {
      id: "resilience", pillar: "emotional", name: "Resilience", icon: "fa-mountain-sun",
      definition: "Bouncing back from setbacks and trying again.",
      why: "Resilience turns failure into learning. It is the single biggest protector of long-term confidence.",
      behaviors: [
        "Tries again after a mistake",
        "Talks about setbacks without shame",
        "Keeps a long-term goal through difficulty",
        "Sees effort as the path to growth",
      ],
      parentPrompts: ["Did your child recover from a disappointment this week?", "Did they keep trying something hard?"],
      reflectionPrompts: ["What was hard that you kept trying anyway?", "What did a mistake teach you?"],
      evidenceTypes: ["observation", "journal", "video"],
      coaching: ["Share your own mistakes and what you learned.", "Praise effort and strategy, not just outcomes."],
      related: ["problem_solving", "self_confidence"],
    },
    {
      id: "self_confidence", pillar: "emotional", name: "Self-Confidence", icon: "fa-star",
      definition: "Believing in one's own ability to learn, try and contribute.",
      why: "Confident children take healthy risks, speak up, and recover faster from setbacks.",
      behaviors: [
        "Volunteers for new or visible roles",
        "Shares an opinion in a group",
        "Tries new things without excessive fear",
        "Speaks about themselves kindly",
      ],
      parentPrompts: ["Did your child volunteer or speak up recently?", "Did they try something new on their own?"],
      reflectionPrompts: ["What are you proud of today?", "What did you do that felt brave?"],
      evidenceTypes: ["observation", "video", "photo"],
      coaching: ["Give real responsibility at home.", "Notice brave attempts, not just wins."],
      related: ["resilience", "public_speaking"],
    },

    // ---------------- Relationships ----------------
    {
      id: "empathy", pillar: "relationships", name: "Empathy", icon: "fa-hand-holding-heart",
      definition: "Understanding and caring about how others feel.",
      why: "Empathy is the foundation of friendship, kindness and leadership.",
      behaviors: [
        "Notices when someone is upset",
        "Comforts or helps a friend",
        "Considers another point of view",
        "Includes others who are left out",
      ],
      parentPrompts: ["Did your child notice or help someone's feelings this week?", "Did they include someone left out?"],
      reflectionPrompts: ["How did you help someone today?", "How do you think your friend felt?"],
      evidenceTypes: ["observation", "journal"],
      coaching: ["Talk about characters' feelings in stories.", "Wonder aloud: 'How do you think they felt?'"],
      related: ["teamwork", "emotional_regulation"],
    },
    {
      id: "teamwork", pillar: "relationships", name: "Teamwork", icon: "fa-people-carry-box",
      definition: "Working well with others toward a shared goal.",
      why: "Almost every meaningful achievement in life is collaborative.",
      behaviors: [
        "Shares and takes turns",
        "Listens to others' ideas",
        "Contributes to a group task",
        "Helps resolve disagreements",
      ],
      parentPrompts: ["Did your child cooperate on something this week?", "How did they handle a disagreement?"],
      reflectionPrompts: ["What did you do as part of a team?", "How did you help the group?"],
      evidenceTypes: ["observation", "photo", "video"],
      coaching: ["Cook or build something together with shared roles.", "Play cooperative (not competitive) games."],
      related: ["empathy", "leadership"],
    },
    {
      id: "leadership", pillar: "relationships", name: "Leadership", icon: "fa-flag",
      definition: "Guiding, motivating and bringing out the best in others.",
      why: "Leadership is service — it grows confidence, communication and responsibility together.",
      behaviors: [
        "Volunteers to organise or lead",
        "Encourages and includes others",
        "Takes responsibility for outcomes",
        "Helps a group reach a decision",
      ],
      parentPrompts: ["Did your child take the lead on something?", "Did they encourage or organise others?"],
      reflectionPrompts: ["When did you help lead today?", "How did you help your group succeed?"],
      evidenceTypes: ["observation", "video", "project"],
      coaching: ["Let them plan a family outing.", "Give them a real role with real responsibility."],
      related: ["communication", "self_confidence"],
    },

    // ---------------- Communication ----------------
    {
      id: "expression", pillar: "communication", name: "Self-Expression", icon: "fa-comment-dots",
      definition: "Sharing thoughts, ideas and feelings clearly.",
      why: "Children who can express themselves are understood, included and heard.",
      behaviors: [
        "Explains an idea so others understand",
        "Tells a story with a clear order",
        "Uses words to express feelings",
        "Asks for what they need",
      ],
      parentPrompts: ["Did your child explain something clearly this week?", "Did they tell you a story about their day?"],
      reflectionPrompts: ["What did you want others to understand today?", "What story did you tell?"],
      evidenceTypes: ["observation", "voice", "video", "journal"],
      coaching: ["Ask open questions at dinner.", "Let them retell a movie or book in their own words."],
      related: ["public_speaking", "creative_thinking"],
    },
    {
      id: "public_speaking", pillar: "communication", name: "Public Speaking", icon: "fa-microphone",
      definition: "Speaking confidently in front of others.",
      why: "The ability to speak up multiplies every other strength a child has.",
      behaviors: [
        "Speaks in front of a small group",
        "Presents an idea or project",
        "Makes eye contact while speaking",
        "Handles nerves and continues",
      ],
      parentPrompts: ["Did your child present or perform for anyone this week?", "Did they speak up in a group?"],
      reflectionPrompts: ["When did you speak in front of others?", "How did it feel, and what went well?"],
      evidenceTypes: ["observation", "video", "voice"],
      coaching: ["Host a tiny 'family TED talk' night.", "Record and watch back together kindly."],
      related: ["expression", "self_confidence"],
    },

    // ---------------- Creativity ----------------
    {
      id: "creative_thinking", pillar: "creativity", name: "Creative Thinking", icon: "fa-wand-magic-sparkles",
      definition: "Generating original ideas and imagining new possibilities.",
      why: "Creativity is the most in-demand human skill of the future — it can't be automated.",
      behaviors: [
        "Comes up with original ideas",
        "Combines ideas in unexpected ways",
        "Imagines alternatives ('what if…')",
        "Enjoys open-ended play",
      ],
      parentPrompts: ["Did your child invent or imagine something this week?", "Did they use materials in a new way?"],
      reflectionPrompts: ["What did you imagine or invent today?", "What's a new idea you had?"],
      evidenceTypes: ["observation", "photo", "project", "video"],
      coaching: ["Offer open-ended materials (boxes, clay).", "Ask 'what else could this be?'"],
      related: ["curiosity", "making"],
    },
    {
      id: "making", pillar: "creativity", name: "Making & Building", icon: "fa-cubes",
      definition: "Bringing ideas to life through art, craft, music or building.",
      why: "Making turns imagination into real skills, patience and pride.",
      behaviors: [
        "Plans then builds something",
        "Improves a creation over time",
        "Expresses through art, music or craft",
        "Finishes a creative project",
      ],
      parentPrompts: ["Did your child make or build something this week?", "Did they revisit and improve a creation?"],
      reflectionPrompts: ["What did you make today?", "What would you add or change?"],
      evidenceTypes: ["photo", "video", "project", "certificate"],
      coaching: ["Keep a 'maker box' of recycled materials.", "Display their creations proudly."],
      related: ["creative_thinking", "focus"],
    },

    // ---------------- Character ----------------
    {
      id: "integrity", pillar: "character", name: "Integrity", icon: "fa-handshake-angle",
      definition: "Being honest and doing the right thing, even when it's hard.",
      why: "Integrity builds trust — the foundation of every relationship and reputation.",
      behaviors: [
        "Tells the truth even when difficult",
        "Keeps promises",
        "Admits mistakes",
        "Does the right thing without being watched",
      ],
      parentPrompts: ["Did your child tell the truth in a hard moment?", "Did they keep a promise this week?"],
      reflectionPrompts: ["When did you do the right thing today?", "When was it hard to be honest?"],
      evidenceTypes: ["observation", "journal"],
      coaching: ["Praise honesty, especially after a mistake.", "Model admitting your own errors."],
      related: ["responsibility", "courage"],
    },
    {
      id: "responsibility", pillar: "character", name: "Responsibility", icon: "fa-clipboard-check",
      definition: "Owning one's actions, tasks and commitments.",
      why: "Responsible children become dependable, trusted and self-reliant adults.",
      behaviors: [
        "Completes chores or tasks without reminders",
        "Owns up to mistakes",
        "Takes care of belongings or others",
        "Follows through on commitments",
      ],
      parentPrompts: ["Did your child complete a responsibility on their own?", "Did they take care of something or someone?"],
      reflectionPrompts: ["What were you responsible for today?", "What did you take care of?"],
      evidenceTypes: ["observation", "photo"],
      coaching: ["Give age-appropriate chores with ownership.", "Let natural consequences teach gently."],
      related: ["integrity", "focus"],
    },

    // ---------------- Personal Effectiveness ----------------
    {
      id: "focus", pillar: "effectiveness", name: "Focus & Attention", icon: "fa-crosshairs",
      definition: "Sustaining attention and finishing what they start.",
      why: "Focus is the gateway skill — it makes every other kind of learning possible.",
      behaviors: [
        "Stays with a task to completion",
        "Returns to a task after a distraction",
        "Works without constant supervision",
        "Plans before starting",
      ],
      parentPrompts: ["Did your child finish a task they started?", "Could they concentrate without being reminded?"],
      reflectionPrompts: ["What did you concentrate hard on today?", "What helped you stay focused?"],
      evidenceTypes: ["observation", "project"],
      coaching: ["Reduce distractions during focused time.", "Use short timers and small steps."],
      related: ["responsibility", "making"],
    },
    {
      id: "organisation", pillar: "effectiveness", name: "Organisation", icon: "fa-list-check",
      definition: "Managing time, tasks and belongings.",
      why: "Organisation reduces stress and frees energy for what matters.",
      behaviors: [
        "Keeps belongings in order",
        "Plans steps for a task",
        "Manages time for an activity",
        "Prepares ahead for the next day",
      ],
      parentPrompts: ["Did your child plan or organise something this week?", "Did they prepare ahead for something?"],
      reflectionPrompts: ["What did you plan or organise today?", "What helped you stay on track?"],
      evidenceTypes: ["observation", "photo"],
      coaching: ["Build simple routines and checklists together.", "Let them own a small planning task."],
      related: ["focus", "responsibility"],
    },

    // ---------------- Health & Physical ----------------
    {
      id: "physical_activity", pillar: "health", name: "Active Movement", icon: "fa-futbol",
      definition: "Enjoying movement, sport and physical play.",
      why: "Physical activity fuels mood, focus, confidence and lifelong health.",
      behaviors: [
        "Chooses to be active",
        "Tries new physical activities",
        "Practises a physical skill",
        "Plays energetically with others",
      ],
      parentPrompts: ["Was your child physically active this week?", "Did they practise a sport or movement skill?"],
      reflectionPrompts: ["How did you move your body today?", "What new active thing did you try?"],
      evidenceTypes: ["observation", "photo", "video", "certificate"],
      coaching: ["Make movement social and fun, not a chore.", "Celebrate effort and improvement."],
      related: ["resilience", "teamwork"],
    },
    {
      id: "healthy_habits", pillar: "health", name: "Healthy Habits", icon: "fa-apple-whole",
      definition: "Caring for body and mind through daily habits.",
      why: "Habits formed in childhood shape health for a lifetime.",
      behaviors: [
        "Helps with healthy meals",
        "Keeps a consistent sleep routine",
        "Manages personal hygiene",
        "Takes screen breaks",
      ],
      parentPrompts: ["Did your child take care of a healthy habit this week?", "Did they help with a healthy meal?"],
      reflectionPrompts: ["What healthy choice did you make today?", "How did you take care of yourself?"],
      evidenceTypes: ["observation", "photo"],
      coaching: ["Involve them in meal planning.", "Make routines visual and consistent."],
      related: ["responsibility", "physical_activity"],
    },

    // ---------------- Future Readiness ----------------
    {
      id: "learning_agility", pillar: "future", name: "Learning Agility", icon: "fa-arrows-rotate",
      definition: "Learning quickly from new situations and feedback.",
      why: "In a changing world, the ability to keep learning matters more than any single fact.",
      behaviors: [
        "Applies a lesson to a new situation",
        "Seeks and uses feedback",
        "Adapts when plans change",
        "Reflects on how they learn best",
      ],
      parentPrompts: ["Did your child learn something new and use it?", "Did they adapt when plans changed?"],
      reflectionPrompts: ["What did you learn that you can use again?", "How did you adapt today?"],
      evidenceTypes: ["observation", "journal", "project"],
      coaching: ["Ask 'what did you learn?' more than 'what did you score?'", "Normalise changing your mind with new information."],
      related: ["curiosity", "resilience"],
    },
    {
      id: "entrepreneurship", pillar: "future", name: "Initiative", icon: "fa-rocket",
      definition: "Spotting opportunities and taking action to create value.",
      why: "Initiative turns ideas into impact and builds a sense of agency.",
      behaviors: [
        "Starts a project or idea independently",
        "Spots a need and acts on it",
        "Persists to turn an idea into reality",
        "Learns from what doesn't work",
      ],
      parentPrompts: ["Did your child start something on their own initiative?", "Did they spot a need and act?"],
      reflectionPrompts: ["What did you start on your own today?", "What idea would you love to try?"],
      evidenceTypes: ["observation", "project", "photo"],
      coaching: ["Support a small 'venture' (a stall, a club).", "Let them experience small, safe risks."],
      related: ["leadership", "creative_thinking"],
    },

    // ---------------- Purpose & Contribution ----------------
    {
      id: "kindness", pillar: "purpose", name: "Kindness & Service", icon: "fa-hands-holding-circle",
      definition: "Helping others and contributing to community.",
      why: "Kindness builds belonging and gives children a sense of meaning beyond themselves.",
      behaviors: [
        "Helps without being asked",
        "Volunteers or contributes to a cause",
        "Shows care for the community or environment",
        "Acts generously",
      ],
      parentPrompts: ["Did your child help someone or a cause this week?", "Did they show care for the environment?"],
      reflectionPrompts: ["How did you make someone's day better?", "What did you do to help your community?"],
      evidenceTypes: ["observation", "photo", "certificate"],
      coaching: ["Do a small act of kindness together weekly.", "Talk about why helping feels good."],
      related: ["empathy", "responsibility"],
    },
    {
      id: "courage", pillar: "purpose", name: "Courage", icon: "fa-dragon",
      definition: "Standing up for what's right and facing fears.",
      why: "Courage lets children act on their values and grow beyond their comfort zone.",
      behaviors: [
        "Tries something despite fear",
        "Stands up for someone or something",
        "Shares an unpopular but honest view",
        "Steps out of their comfort zone",
      ],
      parentPrompts: ["Did your child do something brave this week?", "Did they stand up for what's right?"],
      reflectionPrompts: ["What brave thing did you do today?", "When did you stand up for something?"],
      evidenceTypes: ["observation", "journal", "video"],
      coaching: ["Celebrate brave attempts regardless of outcome.", "Share stories of everyday courage."],
      related: ["self_confidence", "integrity"],
    },
  ];

  // Quick lookup maps.
  P.pillarById = {};
  P.PILLARS.forEach(function (p) { P.pillarById[p.id] = p; });
  P.competencyById = {};
  P.COMPETENCIES.forEach(function (c) { P.competencyById[c.id] = c; });

  P.competenciesByPillar = function (pillarId) {
    return P.COMPETENCIES.filter(function (c) { return c.pillar === pillarId; });
  };

  P.confidenceLevel = function (score) {
    var lvl = P.CONFIDENCE_LEVELS[0];
    for (var i = 0; i < P.CONFIDENCE_LEVELS.length; i++) {
      if (score >= P.CONFIDENCE_LEVELS[i].min) lvl = P.CONFIDENCE_LEVELS[i];
    }
    return lvl;
  };
})(window.Polaris = window.Polaris || {});

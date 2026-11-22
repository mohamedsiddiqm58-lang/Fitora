/**
 * FITORA AI Health Companion Service
 * Context-aware coaching engine with strict safety guardrails,
 * category-based personalization, and dynamic progress awareness.
 */

// Critical medical red flag patterns that trigger immediate emergency warnings
const EMERGENCY_TRIGGERS = [
  /chest pain/i,
  /shortness of breath/i,
  /difficulty breathing/i,
  /fainting|passed out/i,
  /severe dizziness/i,
  /stroke/i,
  /heart attack/i,
  /sudden weakness|facial drooping/i,
  /coughing blood/i,
  /unbearable head pain/i
];

const MEDICATION_ALTERATION_TRIGGERS = [
  /stop taking my medicine/i,
  /change my dose/i,
  /double my medication/i,
  /prescribe/i,
  /what pills should i buy/i,
  /diagnose me/i
];

export class AICompanionService {
  /**
   * Process incoming user prompt with full user health context
   */
  static async generateReply({ userPrompt, userProfile, healthRecords, recentLogs, conversationHistory = [] }) {
    const text = userPrompt.trim();

    // 1. Guardrail: Emergency Red Flags
    for (const pattern of EMERGENCY_TRIGGERS) {
      if (pattern.test(text)) {
        return {
          reply: `🚨 **IMPORTANT HEALTH WARNING:**\n\nYour message indicates symptoms that could be serious (e.g., chest pain, shortness of breath, or severe dizziness). Fitora AI is an automated fitness companion and **cannot provide emergency medical diagnosis or treatment**.\n\n⚠️ **Action Required:**\n- Please stop exercising immediately and sit down in a safe, resting position.\n- Use the **Emergency Call Shortcut** on your Fitora screen or call emergency services (**112** / **108** in India) immediately.\n- If you are with someone, alert them right now.`,
          isEmergencyWarning: true,
          actionRequired: 'EMERGENCY_PROMPT'
        };
      }
    }

    // 2. Guardrail: Prescription / Dosage / Diagnosis
    for (const pattern of MEDICATION_ALTERATION_TRIGGERS) {
      if (pattern.test(text)) {
        return {
          reply: `🩺 **Medical Advice Disclaimer:**\n\nAs your Fitora AI Companion, I am trained to support your lifestyle, fitness, and daily habits, but I **cannot prescribe medications, diagnose diseases, or alter your prescribed dosages**.\n\nPlease follow the exact instructions given by your treating physician or pharmacist. If you are experiencing side effects or feel your dosage needs adjustment, please contact your doctor or schedule a consultation with our verified hospital partners.`,
          isEmergencyWarning: false
        };
      }
    }

    // 3. Category Context Customization
    const category = userProfile?.selectedCategory || 'NORMAL';
    const userName = userProfile?.fullName?.split(' ')[0] || 'Friend';
    const waterMl = recentLogs?.waterToday || 0;
    const streakDays = recentLogs?.streak || 0;
    const completedWorkouts = recentLogs?.completedWorkoutsCount || 0;

    // Check specific intent patterns
    const lower = text.toLowerCase();

    // Intent: Progress Summary
    if (lower.includes('progress') || lower.includes('summary') || lower.includes('how am i doing')) {
      return {
        reply: this.generateProgressSummary(userName, category, waterMl, streakDays, completedWorkouts)
      };
    }

    // Intent: Hydration Check
    if (lower.includes('water') || lower.includes('hydration') || lower.includes('drink')) {
      const remaining = Math.max(0, 2500 - waterMl);
      return {
        reply: `💧 **Hydration Status for ${userName}:**\n\nYou have logged **${waterMl} ml** of water today. ${
          remaining > 0
            ? `You need about **${remaining} ml** more to reach your optimal daily target of 2,500 ml! Keeping hydrated supports metabolic rate, muscle recovery, and mental clarity.`
            : `🎉 Outstanding! You've met and exceeded your daily water goal of 2,500 ml. Keep sipping regularly!`
        }`
      };
    }

    // Intent: Exercise / Workout Advice
    if (lower.includes('exercise') || lower.includes('workout') || lower.includes('routine') || lower.includes('technique')) {
      return {
        reply: this.getWorkoutGuidance(category, userName, lower)
      };
    }

    // Intent: Nutrition / Diet / Meal
    if (lower.includes('meal') || lower.includes('food') || lower.includes('diet') || lower.includes('recipe') || lower.includes('protein')) {
      return {
        reply: this.getNutritionGuidance(category, userName, lower, userProfile)
      };
    }

    // Intent: Check-in response (e.g. "yes I worked out", "done", "not yet")
    if (lower.includes('yes') || lower.includes('done') || lower.includes('completed') || lower.includes('finished')) {
      return {
        reply: `🌟 Wonderful job, ${userName}! Consistency is the foundation of lifelong health. I've noted your accomplishment. Remember to log your session on the dashboard so your daily streak increases!`
      };
    }

    if (lower.includes('tired') || lower.includes('sore') || lower.includes('rest day')) {
      return {
        reply: `🛋️ Rest is an essential component of training, ${userName}. During recovery, your muscles rebuild and glycogen stores replenish. Make sure to drink plenty of water, do light 10-minute dynamic stretching or a slow walk, and aim for 7-8 hours of sleep tonight.`
      };
    }

    // Category-specific general response
    return {
      reply: this.getDefaultCategoryReply(category, userName, text)
    };
  }

  static generateProgressSummary(name, category, waterMl, streak, workouts) {
    let focusNote = '';
    if (category === 'ATHLETE') {
      focusNote = 'Your athletic focus: High-intensity performance, VO2 max endurance, and active tissue recovery.';
    } else if (category === 'SENIOR') {
      focusNote = 'Your wellness focus: Joint mobility, balance routines, steady walking, and timely hydration.';
    } else if (category === 'GYM_FREAK') {
      focusNote = 'Your muscle & physique focus: Progressive resistance overload, protein timing, and recovery sleep.';
    } else {
      focusNote = 'Your lifestyle focus: Consistent daily step count, balanced wholesome meals, and habit continuity.';
    }

    return `📊 **Fitora Progress Summary for ${name}**\n\n- 🔥 **Current Habit Streak:** ${streak} consecutive days\n- 🏋️‍♂️ **Workouts Logged:** ${workouts} completed sessions\n- 💧 **Today's Hydration:** ${waterMl} ml logged\n- 🎯 **Module:** ${category.replace('_', ' ')}\n\n💡 *Coach's Note:*\n${focusNote}\n\nKeep moving forward! Would you like a recommended workout or meal suggestion for today?`;
  }

  static getWorkoutGuidance(category, name, text) {
    if (category === 'SENIOR') {
      return `👵 **Gentle Movement Recommendations for ${name}:**\n\n1. **Seated Knee Extensions:** Sit upright in a sturdy chair, slowly straighten one leg out, hold for 3 seconds, lower gently. Repeat 10 times each side.\n2. **Wall Push-Ups:** Stand an arm's length from the wall, place palms flat, gently bend elbows and press back smoothly (10 reps).\n3. **Supported Calf Raises:** Hold a chair back for balance, slowly rise onto your toes, hold 2 seconds, and lower softly.\n\n*Safety reminder: Move slowly, breathe steadily, and never push through sharp joint discomfort.*`;
    }

    if (category === 'ATHLETE') {
      return `⚡ **Athletic Performance Coaching for ${name}:**\n\n- **Plyometric Power:** Box jumps & explosive split squats build fast-twitch muscle recruitment.\n- **Speed & Agility:** 15-meter shuttle runs with deceleration control reduce ACL injury risks.\n- **Recovery Protocol:** Cool down with 10 minutes of foam rolling and contrast hydrotherapy to flush metabolic waste.\n\nAre you preparing for an upcoming match or focusing on off-season conditioning?`;
    }

    if (category === 'GYM_FREAK') {
      return `💪 **Hypertrophy & Strength Focus for ${name}:**\n\n- **Compound First:** Prioritize Barbell Squats, Romanian Deadlifts, Bench Press, and Weighted Pull-Ups.\n- **Rep Range Strategy:** 6-10 reps for mechanical tension; 10-15 reps for metabolic stress.\n- **RIR (Reps in Reserve):** Train 1-2 reps shy of failure for optimal stimulus-to-fatigue ratio.\n- **Rest Intervals:** Rest 2-3 minutes on heavy compounds to maintain motor unit recruitment.`;
    }

    return `🏃 **Daily Active Routine for ${name}:**\n\n- **20-Minute Core & Cardio:** 30 seconds jumping jacks, 15 bodyweight squats, 20-second plank, 10 push-ups (or knee push-ups). Rest 45 seconds and repeat for 3 rounds.\n- **Brisk Walk:** 3,000 steps outdoors post-lunch or dinner significantly improves postprandial glucose regulation!\n\nWould you like me to start a guided timer for this routine?`;
  }

  static getNutritionGuidance(category, name, text, profile) {
    if (category === 'SENIOR') {
      return `🥗 **Senior Nutrition & Vitality Advice for ${name}:**\n\n- **Calcium & Vitamin D:** Incorporate warm milk, fortified curd/yogurt, ragi porridge, and steamed greens for bone density.\n- **Hydration Routine:** Sip warm water or mild herbal teas throughout the day even before feeling thirsty.\n- **Easy Digestion:** Favor well-cooked lentils (moong dal), steamed vegetables, and soft khichdi over deep-fried items.`;
    }

    if (category === 'ATHLETE') {
      return `🥩 **High-Performance Nutrition for ${name}:**\n\n- **Pre-Workout Fuel (90m prior):** Complex carbohydrates (oatmeal with banana & honey) for sustained glycogen release.\n- **Post-Workout Recovery (within 45m):** 25-30g protein + 50g simple carbs to optimize insulin-mediated muscle protein synthesis.\n- **Electrolyte Balance:** Ensure sodium, magnesium, and potassium replenishment after heavy sweat sessions.`;
    }

    if (category === 'GYM_FREAK') {
      return `🍗 **Muscle Building & Macro Targets for ${name}:**\n\n- **Daily Protein Target:** Aim for 1.8g to 2.2g of protein per kg of bodyweight (e.g. paneer, chicken breast, eggs, tofu, Greek yogurt, whey isolate).\n- **Nutrient Timing:** Distribute protein into 4-5 meals spaced 3-4 hours apart to trigger muscle protein synthesis peaks.\n- **Hydration & Creatine:** If using creatine monohydrate (3-5g daily), drink at least 3.5 liters of water daily.`;
    }

    return `🥑 **Balanced Nutrition for ${name}:**\n\n- **The Healthy Plate Rule:** Fill 1/2 of your plate with colorful vegetables/salad, 1/4 with lean protein (dal, paneer, eggs, sprouts), and 1/4 with whole grains (brown rice, roti, quinoa).\n- **Mindful Snacking:** Replace processed biscuits with a fistful of roasted almonds, walnuts, or roasted chana.`;
  }

  static getDefaultCategoryReply(category, name, text) {
    return `Hello ${name}! I'm your Fitora AI Companion. I'm actively analyzing your health profile and logged metrics in the **${category.replace('_', ' ')}** module.\n\nYou can ask me about:\n- Today's workout routine and exercise form corrections\n- Meal suggestions tailored to your dietary goals\n- Hydration and recovery tracking\n- Explanations of fitness concepts and progress milestones\n\nHow can I help boost your health journey today?`;
  }
}

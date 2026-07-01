import type {
  ChatMessage,
  NutritionPlan,
  Profile,
  UserData,
  WorkoutCompletion,
  WorkoutDay,
  WorkoutPlan,
  WorkoutSession,
} from './types';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const difficultyLibrary: Record<string, string[]> = {
  beginner: ['Foundations', 'Movement quality', 'Light conditioning'],
  intermediate: ['Strength progression', 'Volume control', 'Athletic conditioning'],
  advanced: ['Performance blocks', 'Heavy compounds', 'High-output conditioning'],
};

const focusLibrary: Record<string, { focus: string; moves: string[] }[]> = {
  strength: [
    { focus: 'Upper Body Strength', moves: ['Bench Press', 'One-Arm Row', 'Incline Press'] },
    { focus: 'Lower Body Power', moves: ['Back Squat', 'Romanian Deadlift', 'Walking Lunge'] },
    { focus: 'Posterior Chain Strength', moves: ['Deadlift', 'Hip Thrust', 'Hamstring Curl'] },
  ],
  fatLoss: [
    { focus: 'Full Body Circuit', moves: ['Goblet Squat', 'Push-up', 'Row'] },
    { focus: 'Conditioning Intervals', moves: ['Rowing Sprint', 'Kettlebell Swing', 'Sled Push'] },
    { focus: 'Metabolic Upper Body', moves: ['Dumbbell Complex', 'Battle Ropes', 'Plank Drag'] },
  ],
  mobility: [
    { focus: 'Mobility + Core', moves: ['Pallof Press', 'Side Plank', 'Dead Bug'] },
    { focus: 'Active Recovery', moves: ['Zone 2 Cardio', 'Mobility Flow', 'Breathing Drill'] },
    { focus: 'Movement Reset', moves: ['Deep Squat Hold', 'Cossack Squat', 'Band Stretch'] },
  ],
  endurance: [
    { focus: 'Tempo Cardio', moves: ['Incline Walk', 'Bike Tempo', 'Row Tempo'] },
    { focus: 'Aerobic Intervals', moves: ['Run Intervals', 'Farmer Carry', 'Air Bike'] },
    { focus: 'Engine Builder', moves: ['Step-ups', 'Sled Push', 'Jump Rope'] },
  ],
};

const metValues: Record<string, number> = {
  strength: 6,
  cardio: 7,
  hiit: 8,
  endurance: 7.5,
  flexibility: 2.5,
  core: 4,
  upper: 6,
  lower: 6.5,
  recovery: 2.8,
  default: 5,
};

const difficultyLabel = (difficulty = 'intermediate') => {
  const normalized = difficulty.toLowerCase();
  if (normalized.includes('beginner')) return 'beginner';
  if (normalized.includes('advanced')) return 'advanced';
  return 'intermediate';
};

const parseWorkoutDays = (value?: string) => {
  if (!value) return 5;
  const match = value.match(/\d/);
  return match ? Math.min(7, Math.max(2, Number(match[0]))) : 5;
};

const createExercise = (name: string, index: number, multiplier = 1) => ({
  name,
  sets: Math.max(2, Math.round(3 * multiplier)),
  reps: multiplier >= 1.2 ? '6-8' : '8-12',
  restSeconds: 45 + index * 15,
  notes: index % 2 === 0 ? 'Move with intent and control the eccentric.' : 'Keep the core braced and finish each rep cleanly.',
});

export function createWorkoutPlan(userData: UserData): WorkoutPlan {
  const difficulty = difficultyLabel(userData.difficulty || userData.fitnessLevel);
  const workoutDays = parseWorkoutDays(userData.workoutDaysPerWeek);
  const selectedFocus = userData.focusAreas?.[0]?.toLowerCase() || (userData.fitnessGoals?.join(' ') || '').toLowerCase();
  const profileFocusKey = selectedFocus.includes('endurance')
    ? 'endurance'
    : selectedFocus.includes('mobility')
      ? 'mobility'
      : selectedFocus.includes('weight') || selectedFocus.includes('fat') || selectedFocus.includes('cardio')
        ? 'fatLoss'
        : 'strength';
  const focusPool = focusLibrary[profileFocusKey];
  const intensityMultiplier = difficulty === 'advanced' ? 1.25 : difficulty === 'beginner' ? 0.85 : 1;

  const weeklyPlan: WorkoutDay[] = DAY_NAMES.map((day, index) => {
    const activeSlot = index < workoutDays;

    if (!activeSlot) {
      return {
        day,
        focus: 'Recovery',
        durationMinutes: 20,
        warmup: ['Easy walk', 'Joint circles'],
        exercises: [
          {
            name: 'Light Mobility Session',
            sets: 1,
            reps: '10-15 min',
            restSeconds: 0,
            notes: 'Keep this session easy and restorative.',
          },
        ],
        cooldown: ['Breathing drill', 'Stretching', 'Hydrate'],
      };
    }

    const template = focusPool[index % focusPool.length];

    return {
      day,
      focus: template.focus,
      durationMinutes: Math.round(45 + index * 2 * intensityMultiplier),
      warmup: ['Dynamic walk', 'Arm circles', 'Bodyweight squats'],
      exercises: template.moves.map((move, moveIndex) => createExercise(move, moveIndex, intensityMultiplier)),
      cooldown: ['Slow walk', 'Light stretching', 'Box breathing'],
    };
  });

  return {
    id: `plan_${Date.now()}`,
    userId: 'demo-user',
    title: `${difficulty === 'beginner' ? 'Foundation' : difficulty === 'advanced' ? 'Performance' : 'Progressive'} ${difficulty === 'beginner' ? 'Reset' : 'Split'}`,
    difficulty,
    createdAt: new Date().toISOString(),
    notes: [
      `Difficulty focus: ${difficultyLibrary[difficulty][0]}.`,
      'Build intensity gradually and stop 1-2 reps before failure on most sets.',
      'Prioritize sleep, hydration, and warm-ups so the plan compounds week over week.',
    ],
    weeklyPlan,
  };
}

const estimateCalories = (profile: Partial<Profile>, goalText: string) => {
  const weight = profile.weightKg || 74;
  const activityFactor = parseWorkoutDays(profile.workoutDaysPerWeek) >= 5 ? 17 : 15;
  let calories = Math.round(weight * activityFactor * 2.1);

  if (goalText.includes('lose') || goalText.includes('fat') || goalText.includes('cut')) {
    calories -= 250;
  } else if (goalText.includes('gain') || goalText.includes('build') || goalText.includes('muscle')) {
    calories += 150;
  }

  return calories;
};

export function createNutritionPlan(userData: UserData): NutritionPlan {
  const profileGoal = `${userData.fitnessGoals?.join(' ') || ''} ${userData.difficulty || ''}`.toLowerCase();
  const dailyCalories = estimateCalories(
    {
      weightKg: Number(userData.weight) || 74,
      workoutDaysPerWeek: userData.workoutDaysPerWeek || '5',
    },
    profileGoal
  );
  const protein = Math.round((Number(userData.weight) || 74) * 2.1);
  const fat = Math.round(dailyCalories * 0.28 / 9);
  const carbs = Math.round((dailyCalories - protein * 4 - fat * 9) / 4);

  return {
    id: `nutrition_${Date.now()}`,
    userId: 'demo-user',
    title: 'Performance Nutrition Blueprint',
    createdAt: new Date().toISOString(),
    dailyCalories,
    macros: { protein, carbs, fat },
    tips: [
      'Eat protein at every meal to support recovery.',
      'Use carbs before and after training to keep energy high.',
      'Keep a bottle of water nearby and aim for steady hydration.',
      'If appetite drops, shift calories into shakes, smoothies, and softer foods.',
    ],
    meals: [
      {
        name: 'High-Protein Breakfast',
        time: '7:30 AM',
        calories: Math.round(dailyCalories * 0.22),
        protein: Math.round(protein * 0.22),
        carbs: Math.round(carbs * 0.22),
        fat: Math.round(fat * 0.22),
        foods: ['Eggs', 'Greek yogurt', 'Oats', 'Berries'],
      },
      {
        name: 'Balanced Lunch',
        time: '12:30 PM',
        calories: Math.round(dailyCalories * 0.29),
        protein: Math.round(protein * 0.29),
        carbs: Math.round(carbs * 0.29),
        fat: Math.round(fat * 0.29),
        foods: ['Chicken', 'Rice', 'Vegetables', 'Olive oil'],
      },
      {
        name: 'Training Snack',
        time: '4:00 PM',
        calories: Math.round(dailyCalories * 0.12),
        protein: Math.round(protein * 0.12),
        carbs: Math.round(carbs * 0.12),
        fat: Math.round(fat * 0.12),
        foods: ['Banana', 'Rice cakes', 'Protein shake'],
      },
      {
        name: 'Recovery Dinner',
        time: '8:00 PM',
        calories: Math.round(dailyCalories * 0.37),
        protein: Math.round(protein * 0.37),
        carbs: Math.round(carbs * 0.37),
        fat: Math.round(fat * 0.37),
        foods: ['Salmon', 'Sweet potato', 'Green vegetables', 'Avocado'],
      },
    ],
  };
}

export function createCoachReply(message: string): string {
  const text = message.toLowerCase();

  if (text.includes('workout') || text.includes('training') || text.includes('exercise')) {
    return [
      'Here is the simplest way to improve your training:',
      '',
      '1. Keep your main lifts consistent for 4-6 weeks.',
      '2. Add a small amount of load, reps, or volume each week.',
      '3. Finish each session with a short mobility or cooldown block.',
      '',
      'If you want, I can turn that into a full weekly split for your goal.',
    ].join('\n');
  }

  if (text.includes('meal') || text.includes('nutrition') || text.includes('food')) {
    return [
      'Nutrition works best when it is simple and repeatable:',
      '',
      '- Anchor meals with protein.',
      '- Time carbs around training.',
      '- Keep fiber, hydration, and sleep high.',
      '',
      'Tell me your goal and I will draft a cleaner meal structure for you.',
    ].join('\n');
  }

  if (text.includes('recover') || text.includes('sleep') || text.includes('sore')) {
    return [
      'Recovery is a performance skill, not a bonus.',
      '',
      'Prioritize:',
      '- 7 to 9 hours of sleep',
      '- A 5 to 10 minute cooldown after training',
      '- Enough protein and total calories',
      '- At least 1 easy day per week',
    ].join('\n');
  }

  return [
    'I can help with training, nutrition, recovery, and habit-building.',
    '',
    'Try asking for one of these:',
    '- a workout split',
    '- a meal plan',
    '- recovery advice',
    '- a weekly progress check',
  ].join('\n');
}

const workoutMetKey = (focus: string) => {
  const normalized = focus.toLowerCase();
  if (normalized.includes('strength')) return 'strength';
  if (normalized.includes('interval') || normalized.includes('cardio')) return 'cardio';
  if (normalized.includes('hiit')) return 'hiit';
  if (normalized.includes('endurance')) return 'endurance';
  if (normalized.includes('mobility') || normalized.includes('recovery')) return 'recovery';
  if (normalized.includes('core')) return 'core';
  if (normalized.includes('upper')) return 'upper';
  if (normalized.includes('lower')) return 'lower';
  return 'default';
};

export function calculateCaloriesBurned(workout: WorkoutCompletion, weightKg: number) {
  const metValue = metValues[workoutMetKey(workout.focus)] ?? metValues.default;
  const durationHours = Math.max(0, workout.totalDuration) / 3600;
  const activeDuration = durationHours > 3 ? durationHours * 0.7 : durationHours;
  return Math.round(metValue * weightKg * activeDuration);
}

export function calculateDashboardStats(workouts: WorkoutCompletion[], weightKg: number) {
  const totalWorkouts = workouts.length;
  const totalCalories = workouts.reduce((sum, workout) => sum + calculateCaloriesBurned(workout, weightKg), 0);
  const uniqueDays = new Set(workouts.map((workout) => new Date(workout.completedAt).toDateString())).size;
  const averageCalories = totalWorkouts > 0 ? totalCalories / totalWorkouts : 0;
  const consistencyScore = (uniqueDays / 30) * 100;
  const intensityScore = Math.min(100, (averageCalories / 300) * 100);
  const fitnessScore = Math.min(100, Math.round((totalWorkouts * 30 + consistencyScore * 40 + intensityScore * 30) / 100));

  return {
    workoutsCompleted: totalWorkouts,
    caloriesBurned: totalCalories,
    activeDays: uniqueDays,
    fitnessScore,
  };
}

export function formatSeconds(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function getTrainableWorkoutIndex(
  plan: WorkoutPlan | null,
  completedWorkouts: WorkoutCompletion[],
  activeSession: WorkoutSession | null
) {
  if (!plan) {
    return null;
  }

  if (activeSession && activeSession.workoutPlanId === plan.id) {
    return activeSession.dayIndex;
  }

  const completedForPlan = new Set(
    completedWorkouts
      .filter((workout) => workout.workoutPlanId === plan.id)
      .map((workout) => (typeof workout.dayIndex === 'number' ? workout.dayIndex : -1))
      .filter((index) => index >= 0)
  );

  const nextIndex = plan.weeklyPlan.findIndex((day, index) => {
    const isRest = day.focus === 'Rest' || day.focus === 'Recovery';
    return !isRest && !completedForPlan.has(index);
  });

  return nextIndex >= 0 ? nextIndex : null;
}

export function seedChatHistory(): ChatMessage[] {
  return [];
}

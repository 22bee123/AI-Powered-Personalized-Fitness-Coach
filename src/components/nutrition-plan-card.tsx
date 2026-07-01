import type { NutritionPlan } from '@/lib/types';
import { SparklesIcon } from '@heroicons/react/24/outline';

export function NutritionPlanCard({ plan }: { plan: NutritionPlan | null }) {
  if (!plan) {
    return (
      <section className="card placeholder-card">
        <h3>No nutrition plan yet</h3>
        <p>Generate a nutrition blueprint and your daily meals will appear here.</p>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="section-header">
        <div>
          <span className="pill">Nutrition plan</span>
          <h3>{plan.title}</h3>
          <p>{plan.dailyCalories.toLocaleString()} calories with a clean macro split.</p>
        </div>
        <div className="plan-stat">
          <SparklesIcon className="icon" />
          <span>{plan.meals.length} meals</span>
        </div>
      </div>

      <div className="macro-grid">
        <div>
          <strong>{plan.macros.protein}g</strong>
          <span>Protein</span>
        </div>
        <div>
          <strong>{plan.macros.carbs}g</strong>
          <span>Carbs</span>
        </div>
        <div>
          <strong>{plan.macros.fat}g</strong>
          <span>Fat</span>
        </div>
      </div>

      <div className="meal-grid">
        {plan.meals.map((meal) => (
          <article key={meal.name} className="meal-card">
            <div className="meal-card__top">
              <div>
                <p className="day-card__day">{meal.time}</p>
                <h4>{meal.name}</h4>
              </div>
              <span>{meal.calories} cal</span>
            </div>
            <p className="meal-macros">
              P {meal.protein}g · C {meal.carbs}g · F {meal.fat}g
            </p>
            <div className="tag-row">
              {meal.foods.map((food) => (
                <span key={food} className="tag">
                  {food}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="plan-notes">
        {plan.tips.map((tip) => (
          <p key={tip}>{tip}</p>
        ))}
      </div>
    </section>
  );
}


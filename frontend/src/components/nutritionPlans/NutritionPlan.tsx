import React from 'react';

interface NutritionItem {
  meal: string;
  time: string;
  foods: string[];
  calories: number;
}

interface NutritionPlanProps {
  nutritionSchedule?: NutritionItem[];
}

const NutritionPlan: React.FC<NutritionPlanProps> = ({ nutritionSchedule = defaultNutritionSchedule }) => {
  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Daily Nutrition Schedule</h2>
          <p className="text-gray-600 mt-1">Your personalized meal plan (2,250 calories)</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Customize Plan
        </button>
      </div>
      
      <div className="space-y-6">
        {nutritionSchedule.map((meal) => (
          <div key={meal.meal} className="bg-gray-50 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-gray-900">{meal.meal}</h3>
              <span className="text-sm text-gray-500">{meal.time}</span>
            </div>
            <div className="flex justify-between items-start">
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                {meal.foods.map((food, idx) => (
                  <li key={idx}>{food}</li>
                ))}
              </ul>
              <div className="bg-indigo-100 px-3 py-1 rounded-full text-sm font-medium text-indigo-800">
                {meal.calories} cal
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 bg-indigo-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nutrition Tips</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li>Drink at least 8 glasses of water throughout the day</li>
          <li>Try to eat your meals at consistent times each day</li>
          <li>Include protein with each meal to support muscle recovery</li>
          <li>Consume complex carbohydrates before workouts for energy</li>
          <li>Adjust portion sizes based on your activity level for the day</li>
        </ul>
      </div>
      
      <div className="mt-6 flex justify-end space-x-4">
        <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
          Download PDF
        </button>
        <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
          Generate Shopping List
        </button>
      </div>
    </div>
  );
};

// Default nutrition schedule if none is provided
const defaultNutritionSchedule = [
  { meal: 'Breakfast', time: '7:00 AM', foods: ['Oatmeal with berries', 'Greek yogurt', 'Coffee'], calories: 450 },
  { meal: 'Morning Snack', time: '10:00 AM', foods: ['Apple', 'Handful of almonds'], calories: 200 },
  { meal: 'Lunch', time: '1:00 PM', foods: ['Grilled chicken salad', 'Whole grain bread', 'Olive oil dressing'], calories: 550 },
  { meal: 'Afternoon Snack', time: '4:00 PM', foods: ['Protein shake', 'Banana'], calories: 250 },
  { meal: 'Dinner', time: '7:00 PM', foods: ['Salmon', 'Brown rice', 'Steamed vegetables'], calories: 650 },
  { meal: 'Evening Snack', time: '9:00 PM', foods: ['Cottage cheese', 'Berries'], calories: 150 }
];

export default NutritionPlan;
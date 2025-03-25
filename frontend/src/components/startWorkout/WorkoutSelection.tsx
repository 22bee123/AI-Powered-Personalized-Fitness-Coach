import React from 'react';
import { WorkoutPlan, Workout } from './types';
import { 
  CalendarIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  PlayIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';
import StartWorkoutComplete from './StartWorkoutComplete';

interface WorkoutSelectionProps {
  workoutPlan: WorkoutPlan;
  selectedDay: string | null;
  activeWorkout: Workout | null;
  setSelectedDay: (day: string) => void;
  onStartWorkout: () => void;
  onContinueWorkout: () => void;
  setActiveTab?: (tab: string) => void;
}

const WorkoutSelection: React.FC<WorkoutSelectionProps> = ({
  workoutPlan,
  selectedDay,
  activeWorkout,
  setSelectedDay,
  onStartWorkout,
  onContinueWorkout,
  setActiveTab
}) => {
  // Get today's day name
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = daysOfWeek[new Date().getDay()];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Your Weekly Workout Plan</h1>
            <p className="text-indigo-100 text-sm md:text-base">
              Stay consistent with your training to reach your fitness goals
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 text-white px-4 py-2 rounded-xl text-sm md:text-base font-medium">
              Difficulty: {workoutPlan.difficulty}
            </div>
            <div className="bg-white/20 text-white px-4 py-2 rounded-xl text-sm md:text-base font-medium">
              {Object.values(workoutPlan.weeklyPlan).filter(day => day.isCompleted).length}/{Object.keys(workoutPlan.weeklyPlan).length} Completed
            </div>
          </div>
        </div>
        
        {/* Weekly progress bar */}
        <div className="mt-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Weekly Progress</span>
            <span className="text-sm font-medium">
              {Math.round((Object.values(workoutPlan.weeklyPlan).filter(day => day.isCompleted).length / Object.keys(workoutPlan.weeklyPlan).length) * 100)}%
            </span>
          </div>
          <div className="relative h-3 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="absolute h-full bg-white transition-all duration-500 ease-out"
              style={{width: `${(Object.values(workoutPlan.weeklyPlan).filter(day => day.isCompleted).length / Object.keys(workoutPlan.weeklyPlan).length) * 100}%`}}
            ></div>
          </div>
          <div className="flex justify-between mt-2">
            {Object.keys(workoutPlan.weeklyPlan).map((day, index) => {
              const isCompleted = workoutPlan.weeklyPlan[day].isCompleted;
              return (
                <div 
                  key={day}
                  className={`h-6 w-6 flex items-center justify-center rounded-full text-xs ${
                    isCompleted
                      ? 'bg-white text-indigo-600'
                      : day === today 
                        ? 'bg-yellow-300 text-indigo-800' 
                        : 'bg-white/30 text-white'
                  }`}
                >
                  {index + 1}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Today's workout highlight */}
      {(() => {
        if (workoutPlan.weeklyPlan[today] && 
            !workoutPlan.weeklyPlan[today].isCompleted && 
            !workoutPlan.weeklyPlan[today].focus.toLowerCase().includes('rest')) {
          
          return (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-2xl shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start md:items-center gap-4">
                  <div className="bg-blue-500 p-3 rounded-full">
                    <CalendarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="bg-yellow-300 text-yellow-800 text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full inline-block mb-2">Today's Workout</div>
                    <h2 className="text-xl font-bold text-gray-900">{workoutPlan.weeklyPlan[today].focus}</h2>
                    <p className="text-gray-600 mt-1 max-w-md">
                      {workoutPlan.weeklyPlan[today].exercises.length} exercises • {workoutPlan.weeklyPlan[today].duration} • {workoutPlan.weeklyPlan[today].exercises.length} muscle groups
                    </p>
                  </div>
                </div>
                <div className="ml-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDay(today);
                      onStartWorkout();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center font-medium shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <PlayIcon className="h-5 w-5 mr-2" />
                    Start Today's Workout
                  </button>
                </div>
              </div>
            </div>
          );
        }
        return null;
      })()}
      
      {/* Workout days grid */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Schedule</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Object.entries(workoutPlan.weeklyPlan).map(([day, dayPlan]) => {
            const isCompleted = dayPlan.isCompleted;
            const isSelected = selectedDay === day;
            const isRestDay = dayPlan.focus.toLowerCase().includes('rest');
            const isToday = day === today;
            const isPast = daysOfWeek.indexOf(day) < daysOfWeek.indexOf(today) && !isToday;
            
            return (
              <div
                key={day}
                onClick={() => isToday && !isRestDay && !isCompleted ? setSelectedDay(day) : null}
                className={`relative rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                  isSelected 
                    ? 'ring-4 ring-indigo-300 ring-offset-2 border-indigo-400 shadow-lg' 
                    : isCompleted
                      ? 'border-green-300 bg-green-50'
                      : isRestDay
                        ? 'border-gray-200 bg-gray-50'
                        : isToday
                          ? 'border-blue-400 bg-blue-50 hover:shadow-lg cursor-pointer transform hover:scale-105'
                          : isPast
                            ? 'border-gray-200 bg-gray-50 opacity-80'
                            : 'border-gray-200 bg-white hover:border-indigo-200'
                }`}
              >
                {/* Day header */}
                <div className={`p-4 ${
                  isCompleted 
                    ? 'bg-green-100' 
                    : isRestDay 
                      ? 'bg-gray-100' 
                      : isToday 
                        ? 'bg-blue-100' 
                        : isPast 
                          ? 'bg-gray-100' 
                          : 'bg-indigo-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : isRestDay 
                            ? 'bg-gray-400 text-white' 
                            : isToday 
                              ? 'bg-blue-500 text-white' 
                              : isPast 
                                ? 'bg-gray-300 text-gray-700' 
                                : 'bg-indigo-500 text-white'
                      }`}>
                        {day.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{day.charAt(0).toUpperCase() + day.slice(1)}</div>
                        <div className="text-xs text-gray-500">Day {Object.keys(workoutPlan.weeklyPlan).indexOf(day) + 1}</div>
                      </div>
                    </div>
                    {isToday && (
                      <div className="bg-yellow-300 text-yellow-800 text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full">
                        Today
                      </div>
                    )}
                  </div>
                </div>

                {/* Workout details */}
                <div className="p-4">
                  <div className="mb-3">
                    <div className="text-lg font-semibold text-gray-900">{dayPlan.focus}</div>
                    {!isRestDay && (
                      <div className="text-sm text-gray-600 mt-1">
                        {dayPlan.exercises.length} exercises • {dayPlan.duration}
                      </div>
                    )}
                  </div>

                  {/* Exercise list preview */}
                  {!isRestDay && dayPlan.exercises.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {dayPlan.exercises.slice(0, 3).map((exercise, idx) => (
                        <div key={idx} className="flex items-center text-sm">
                          <div className="h-2 w-2 rounded-full bg-indigo-400 mr-2"></div>
                          <span className="text-gray-700 truncate">{exercise.name}</span>
                        </div>
                      ))}
                      {dayPlan.exercises.length > 3 && (
                        <div className="text-xs text-indigo-600 font-medium">
                          +{dayPlan.exercises.length - 3} more exercises
                        </div>
                      )}
                    </div>
                  )}

                  {/* Status and action */}
                  <div className="flex items-center justify-between mt-2">
                    {isCompleted ? (
                      <div className="flex items-center text-green-600 text-sm font-medium">
                        <CheckCircleIcon className="h-5 w-5 mr-1" />
                        Completed
                      </div>
                    ) : isRestDay ? (
                      <div className="text-gray-500 text-sm font-medium">Rest Day</div>
                    ) : isToday ? (
                      <div className="flex items-center text-blue-600 text-sm font-medium">
                        <PlayIcon className="h-5 w-5 mr-1" />
                        Ready to Start
                      </div>
                    ) : isPast ? (
                      <div className="text-gray-500 text-sm font-medium">Missed</div>
                    ) : (
                      <div className="text-gray-500 text-sm font-medium">
                        <ClockIcon className="h-5 w-5 mr-1 inline" />
                        Upcoming
                      </div>
                    )}
                    
                    {isSelected && isToday && !isRestDay && !isCompleted && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartWorkout();
                        }}
                        className="bg-indigo-600 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                      >
                        <PlayIcon className="h-4 w-4 mr-1" />
                        Start
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Bottom indicator */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 ${
                  isCompleted 
                    ? 'bg-green-500' 
                    : isToday && !isRestDay 
                      ? 'bg-blue-500' 
                      : 'bg-transparent'
                }`}></div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Stats cards */}
      <StartWorkoutComplete workoutPlan={workoutPlan} setActiveTab={setActiveTab} />

      {/* Active workout notification */}
      {activeWorkout && (
        <div className="bg-indigo-50 border border-indigo-100 mt-6 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-indigo-600 mr-2" />
              <div className="text-indigo-900 font-medium">
                You have an active workout in progress
              </div>
            </div>
            <button
              type="button"
              onClick={onContinueWorkout}
              className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
            >
              <PlayIcon className="h-4 w-4 mr-1" />
              Continue Workout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutSelection; 
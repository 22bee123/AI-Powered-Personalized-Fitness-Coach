import WorkoutSchedule from '../components/WorkoutSchedule';

export default function WorkoutSchedulePage() {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Workout Schedule</h1>
      <WorkoutSchedule />
    </div>
  );
}

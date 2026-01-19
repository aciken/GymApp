const programData = {};

const dailyDos = [
  { id: '1', task: 'Time spent in the sun', type: 'slider', goal: 30, unit: 'minutes', maxValue: 90, step: 15, icon: 'sunny-outline', progress: 0, impact: 15 },
  { id: '2', task: 'Weight Training', type: 'simple', icon: 'barbell-outline', modalIcon: 'barbell', progress: 0, impact: 30 },
  { id: '3', task: 'Eat a meal', type: 'meals', icon: 'restaurant-outline', progress: 0, meals: [], impact: 30 },
  { id: '4', task: 'Sleep', type: 'slider', goal: 8, unit: 'hours', maxValue: 12, step: 1, icon: 'bed-outline', progress: 0, impact: 30 },
  { id: '5', task: 'Take your supplements', type: 'checklist', icon: 'flask-outline', progress: 0, checklist: [{ id: 'c1', name: 'Zinc', done: false }, { id: 'c2', name: 'Magnesium', done: false }, { id: 'c3', name: 'Ashwagandha', done: false }, { id: 'c4', name: 'Creatine', done: false }], impact: 20 },
];

const dailyDonts = [
  { id: 'd1', task: 'Masturbation', type: 'simple', inverted: true, icon: 'hand-left-outline', modalIcon: 'hand-left', progress: 0, impact: 70 },
  { id: 'd2', task: 'Stress Level', type: 'slider', inverted: true, goal: 3, unit: 'level', maxValue: 5, step: 1, progress: 0, icon: 'alert-circle-outline', impact: 25 },
  { id: 'd3', task: 'Alcohol Consumption', type: 'slider', inverted: true, goal: 1, unit: 'drinks', maxValue: 5, step: 1, progress: 0, icon: 'wine-outline', impact: 40 },

];

const deepCopy = (tasks) => {
  return tasks.map(task => {
    const newTask = { ...task };
    if (task.meals) {
      newTask.meals = task.meals.map(meal => ({ ...meal }));
    }
    if (task.checklist) {
      newTask.checklist = task.checklist.map(item => ({ ...item }));
    }
    return newTask;
  });
};

for (let i = 1; i <= 90; i++) {
  programData[i] = {
    dos: deepCopy(dailyDos),
    donts: deepCopy(dailyDonts),
  };
}

export { dailyDos, dailyDonts };
export default programData;

const dailyDos = [
  { id: '1', task: 'Time spent in the sun', type: 'slider', goal: 30, unit: 'minutes', maxValue: 480, step: 15, progress: 0, impact: 15 },
  { id: '2', task: 'Weight Training', type: 'simple', progress: 0, impact: 40 },
  { id: '3', task: 'Eat a meal', type: 'meals', progress: 0, meals: [], impact: 25 },
  { id: '4', task: 'Sleep', type: 'slider', goal: 8, unit: 'hours', maxValue: 12, step: 1, progress: 0, impact: 35 },
  { id: '5', task: 'Take your supplements', type: 'checklist', progress: 0, checklist: [{ id: 'c1', name: 'Zinc', done: false }, { id: 'c2', name: 'Magnesium', done: false }, { id: 'c3', name: 'Ashwagandha', done: false }, { id: 'c4', name: 'Creatine', done: false }], impact: 10 },
];

const dailyDonts = [
  { id: 'd1', task: 'Masturbation', type: 'simple', inverted: true, progress: 0, impact: 70 },
  { id: 'd2', task: 'Stress Level', type: 'slider', inverted: true, goal: 3, unit: 'level', maxValue: 5, step: 1, progress: 0, impact: 25 },
  { id: 'd3', task: 'Alcohol Consumption', type: 'slider', inverted: true, goal: 1, unit: 'drinks', maxValue: 5, step: 1, progress: 0, impact: 40 },
];

const allTasks = [...dailyDos, ...dailyDonts];

const taskMap = allTasks.reduce((map, task) => {
    map[task.id] = task;
    return map;
}, {});

module.exports = { dailyDos, dailyDonts, taskMap };

const achievements = {
  '1': {
    id: '1',
    name: 'First Victory',
    description: 'Complete your first day.',
    criteria: {
      type: 'first_task',
    },
  },
  '2': {
    id: '2',
    name: '300',
    description: 'Reach a testosterone score of 300.',
    criteria: {
      type: 't_score',
      score: 300,
    },
  },
  '3': {
    id: '3',
    name: 'T-Level 500',
    description: 'Reach a testosterone score of 500.',
    criteria: {
      type: 't_score',
      score: 500,
    },
  },
  '4': {
    id: '4',
    name: '1000',
    description: 'Reach a testosterone score of 1000.',
    criteria: {
      type: 't_score',
      score: 1000,
    },
  },
  '5': {
    id: '5',
    name: 'Streak Master',
    description: 'Reach a 3-day streak.',
    criteria: {
      type: 'streak',
      days: 3,
    },
  },
  '6': {
    id: '6',
    name: 'Streak Advanced',
    description: 'Reach a 5-day streak.',
    criteria: {
      type: 'streak',
      days: 5,
    },
  },
  '7': {
    id: '7',
    name: 'Streak Master',
    description: 'Reach a 10-day streak.',
    criteria: {
      type: 'streak',
      days: 10,
    },
  },
  // '8': {
  //   id: '8',
  //   name: 'Streak ',
  //   description: 'Reach +8 ng/dl in a single day.',
  //   criteria: {
  //     type: 'ngdl_score',
  //     score: 8,
  //   },
  // },
  '9': {
    id: '9',
    name: 'Exercise Bronze',
    description: 'Complete 5 days of exercise.',
    criteria: {
      type: 'exercise',
      days: 5,
    },
  },
  '10': {
    id: '10',
    name: 'Exercise Gold',
    description: 'Complete 30 days of exercise.',
    criteria: {
      type: 'exercise',
      days: 10,
    },
  },
  '11': {
    id: '11',
    name: 'Exercise Diamond',
    description: 'Complete 60 days of exercise.',
    criteria: {
      type: 'exercise',
      days: 30,
    },
  },
  '12': {
    id: '12',
    name: 'Sun Bronze',
    description: 'Spend 5 hours in the sun.',
    criteria: {
      type: 'sun_exposure',
      minutes: 150, // 5 hours
    },
  },
  '13': {
    id: '13',
    name: 'Sun Gold',
    description: 'Spend 10 hours in the sun.',
    criteria: {
      type: 'sun_exposure',
      minutes: 300, // 10 hours
    },
  },
  '14': {
    id: '14',
    name: 'Sun Diamond',
    description: 'Spend 20 hours in the sun.',
    criteria: {
      type: 'sun_exposure',
      minutes: 900, // 20 hours
    },
  },
  '15': {
    id: '15',
    name: 'Sleep Bronze',
    description: 'Complete 10 days of sleep.',
    criteria: {
      type: 'sleep',
      days: 5,
    },
  },
  '16': {
    id: '16',
    name: 'Sleep Gold',
    description: 'Complete 30 days of sleep.',
    criteria: {
      type: 'sleep',
      days: 10,
    },
  },
  '17': {
    id: '17',
    name: 'Sleep Diamond',
    description: 'Complete 60 days of sleep.',
    criteria: {
      type: 'sleep',
      days: 30,
    },
  },
  '18': {
    id: '18',
    name: 'Diet Bronze',
    description: 'Complete 10 days of healthy diet',
    criteria: {
      type: 'diet',
      days: 5,
    },
  },
  '19': {
    id: '19',
    name: 'Diet Gold',
    description: 'Complete 30 days of healthy diet',
    criteria: {
      type: 'diet',
      days: 10,
    },
  },
  '20': {
    id: '20',
    name: 'Diet Diamond',
    description: 'Complete 60 days of healthy diet',
    criteria: {
      type: 'diet',
      days: 30,
    },
  },
  '21': {
    id: '21',
    name: 'Supplementation Bronze',
    description: 'Complete 10 days of taking supplements',
    criteria: {
      type: 'supplementation',
      days: 5,
    },
  },
  '22': {
    id: '22',
    name: 'Supplementation Gold',
    description: 'Complete 30 days of taking supplements',
    criteria: {
      type: 'supplementation',
      days: 10,
    },
  },
  '23': {
    id: '23',
    name: 'Supplementation Diamond',
    description: 'Complete 60 days of taking supplements',
    criteria: {
      type: 'supplementation',
      days: 30,
    },
  },
};

module.exports = achievements;

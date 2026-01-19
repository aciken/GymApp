import React from 'react';
import OnboardingQuestion from '../../components/OnboardingQuestion';

export default function Question6() {
  return (
    <OnboardingQuestion
      questionNumber={6}
      question="What kind of exercise do you do?"
      answers={['Cardio (running, cycling)', 'Weightlifting', 'Team sports', "I don't exercise"]}
      nextPage="/onboarding/question7"
    />
  );
}

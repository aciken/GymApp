import React from 'react';
import OnboardingQuestion from '../../components/OnboardingQuestion';

export default function Question12() {
  return (
    <OnboardingQuestion
      questionNumber={12}
      question="How often do you feel like you don't have energy?"
      answers={['Almost every day', 'A few times a week', 'Occasionally', 'Rarely']}
      nextPage="/onboarding/question13"
    />
  );
}

import React from 'react';
import OnboardingQuestion from '../../components/OnboardingQuestion';

export default function Question2() {
  return (
    <OnboardingQuestion
      questionNumber={2}
      question="How much do you sleep per night?"
      answers={['Less than 5 hours', '5-7 hours', '7-8 hours', 'More than 8 hours']}
      nextPage="/onboarding/question3"
    />
  );
}

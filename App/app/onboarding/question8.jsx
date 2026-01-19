import React from 'react';
import OnboardingQuestion from '../../components/OnboardingQuestion';

export default function Question8() {
  return (
    <OnboardingQuestion
      questionNumber={8}
      question="How often do you wake up with an erection?"
      answers={['Almost every morning', 'Sometimes', 'Rarely', 'Never']}
      nextPage="/onboarding/question9"
    />
  );
}

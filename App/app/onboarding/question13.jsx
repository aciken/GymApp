import React from 'react';
import OnboardingQuestion from '../../components/OnboardingQuestion';

export default function Question13() {
  return (
    <OnboardingQuestion
      questionNumber={13}
      question="How often do you drink alcohol?"
      answers={['Almost every day', 'A few times a week', 'Occasionally', 'Rarely or never']}
      nextPage="/onboarding/heightWeight"
    />
  );
}

import React from 'react';
import OnboardingQuestion from '../../components/OnboardingQuestion';

export default function Question4() {
  return (
    <OnboardingQuestion
      questionNumber={4}
      question="How often do you masturbate?"
      answers={['Multiple times a day', 'Daily', 'A few times a week', 'Rarely or never']}
      nextPage="/onboarding/question5"
    />
  );
}

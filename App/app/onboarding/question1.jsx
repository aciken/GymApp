import React from 'react';
import OnboardingQuestion from '../../components/OnboardingQuestion';

export default function Question1() {
  return (
    <OnboardingQuestion
      questionNumber={1}
      question="How old are you?"
      answers={['Under 18', '18-24', '25-34', '35-44', '45+']}
      nextPage="/onboarding/question2"
    />
  );
}

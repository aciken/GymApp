import React from 'react';
import OnboardingQuestion from '../../components/OnboardingQuestion';

export default function Question11() {
  return (
    <OnboardingQuestion
      questionNumber={11}
      question="Do you have frequent mood swings?"
      answers={['Yes, very frequently', 'Sometimes', 'Rarely', 'Almost never']}
      nextPage="/onboarding/question12"
    />
  );
}

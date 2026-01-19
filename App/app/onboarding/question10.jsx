import React from 'react';
import OnboardingQuestion from '../../components/OnboardingQuestion';

export default function Question10() {
  return (
    <OnboardingQuestion
      questionNumber={10}
      question="Is your hairline receding?"
      answers={['Yes, significantly', 'Yes, slightly', "No, it's stable", "It's fuller than before"]}
      nextPage="/onboarding/question11"
    />
  );
}

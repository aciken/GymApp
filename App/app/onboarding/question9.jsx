import React from 'react';
import OnboardingQuestion from '../../components/OnboardingQuestion';

export default function Question9() {
  return (
    <OnboardingQuestion
      questionNumber={9}
      question="Do you have a lot of body hair?"
      answers={['Yes, a lot', 'Average amount', 'Less than average', 'Very little']}
      nextPage="/onboarding/question10"
    />
  );
}

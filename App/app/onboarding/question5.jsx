import React from 'react';
import OnboardingQuestion from '../../components/OnboardingQuestion';

export default function Question5() {
  return (
    <OnboardingQuestion
      questionNumber={5}
      question="Do you exercise?"
      answers={['Yes, regularly', 'Yes, occasionally', 'No, but I want to', 'No']}
      nextPage="/onboarding/question6"
    />
  );
}

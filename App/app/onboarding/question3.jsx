import React from 'react';
import OnboardingQuestion from '../../components/OnboardingQuestion';

export default function Question3() {
  return (
    <OnboardingQuestion
      questionNumber={3}
      question="What is your diet like?"
      answers={['High in processed foods', 'Balanced', 'High protein', 'Vegetarian/Vegan']}
      nextPage="/onboarding/question4"
    />
  );
}

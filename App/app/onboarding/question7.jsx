import React from 'react';
import OnboardingQuestion from '../../components/OnboardingQuestion';

export default function Question7() {
  return (
    <OnboardingQuestion
      questionNumber={7}
      question="Do you have a problem with putting on muscle?"
      answers={["Yes, it's very difficult", "It's a bit of a struggle", "No, it's relatively easy", "I haven't tried"]}
      nextPage="/onboarding/question8"
    />
  );
}

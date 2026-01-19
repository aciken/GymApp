import React, { createContext, useContext, useState } from 'react';

const OnboardingContext = createContext();

export const useOnboardingContext = () => useContext(OnboardingContext);

export const OnboardingProvider = ({ children }) => {
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);

  const saveAnswer = (questionNumber, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionNumber]: answer,
    }));
  };

  return (
    <OnboardingContext.Provider value={{ answers, saveAnswer, score, setScore }}>
      {children}
    </OnboardingContext.Provider>
  );
};

import React from 'react';

interface TestQuestionProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  options: string[];
  selectedOption: string | null;
  onSelectOption: (option: string) => void;
}

const TestQuestion: React.FC<TestQuestionProps> = ({
  questionNumber,
  totalQuestions,
  question,
  options,
  selectedOption,
  onSelectOption
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 md:p-8 transition-all duration-300">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-2">
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
            Question {questionNumber} sur {totalQuestions}
          </span>
          <div className="w-full sm:w-48 bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-8">{question}</h3>
      
      <div className="space-y-4">
        {options.map((option) => (
          <div 
            key={option}
            className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 transform hover:scale-[1.01] ${
              selectedOption === option 
                ? 'border-blue-600 bg-blue-50 shadow-md' 
                : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
            }`}
            onClick={() => onSelectOption(option)}
          >
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${
                selectedOption === option 
                  ? 'border-blue-600 bg-white' 
                  : 'border-gray-300'
              }`}>
                {selectedOption === option && (
                  <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse"></div>
                )}
              </div>
              <span className={`${selectedOption === option ? 'text-blue-800 font-medium' : 'text-gray-700'}`}>
                {option}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestQuestion;
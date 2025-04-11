"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"
import TestQuestion from "../components/TestQuestion"
import { orientationService } from "../services/api-services"
import { useNavigate } from "react-router-dom"

const OrientationTestPage = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({})
  const [questions, setQuestions] = useState<any[]>([])
  const [testResults, setTestResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Charger les questions du test
    const fetchQuestions = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await orientationService.getQuestions()
        setQuestions(data)
      } catch (err) {
        console.error("Erreur lors du chargement des questions:", err)
        setError("Impossible de charger les questions du test. Veuillez réessayer plus tard.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestions()
  }, [])

  const handleSelectOption = (questionId: number, optionId: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [questionId]: optionId,
    }))
  }

  const handleNext = async () => {
    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1)
    } else {
      // Soumettre le test
      setIsLoading(true)
      setError(null)

      try {
        const answers = Object.entries(selectedOptions).map(([questionId, answer]) => ({
          question_id: parseInt(questionId),
          answer: answer
        }))
        const results = await orientationService.submitAnswers(answers)
        setTestResults(results)
        setCurrentStep(questions.length + 1)
      } catch (err) {
        console.error("Erreur lors de la soumission du test:", err)
        setError("Impossible de soumettre le test. Veuillez réessayer plus tard.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isCurrentQuestionAnswered = () => {
    return selectedOptions[currentStep] !== undefined
  }

  const renderProgressBar = () => {
    const progress = ((currentStep - 1) / questions.length) * 100

    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8 overflow-hidden">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    )
  }

  const renderQuestion = () => {
    const question = questions[currentStep - 1]

    return (
      <TestQuestion
        questionNumber={currentStep}
        totalQuestions={questions.length}
        question={question.question}
        options={question.options}
        selectedOption={selectedOptions[question.id] || null}
        onSelectOption={(optionId) => handleSelectOption(question.id, optionId)}
      />
    )
  }

  const renderResults = () => {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 md:p-10 text-center">
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-green-100 text-green-600 animate-pulse">
            <CheckCircle className="h-14 w-14" />
          </div>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Test d'orientation complété !</h2>
        <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
          Merci d'avoir répondu à toutes les questions. Nous avons analysé vos réponses et préparé des recommandations
          personnalisées pour vous aider dans votre orientation.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 md:p-8 mb-10">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Vos domaines d'études recommandés</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testResults &&
              testResults.recommended_fields &&
              testResults.recommended_fields.map((field: string, index: number) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
                  <h4 className="font-semibold text-blue-600 mb-1">{field}</h4>
                </div>
              ))}
          </div>
        </div>

        <div className="mb-10">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Programmes recommandés</h3>
          <div className="space-y-4">
            {testResults &&
              testResults.recommended_programs &&
              testResults.recommended_programs.map((program: any) => (
                <div key={program.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-left">
                      <h4 className="font-bold text-blue-600 text-lg">{program.name}</h4>
                      <p className="text-gray-700">{program.university_name}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">{program.level}</span>
                        <span>•</span>
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">{program.field}</span>
                      </div>
                    </div>
                    <div className="text-center sm:text-right">
                      <div className="inline-flex flex-col items-center justify-center bg-green-50 rounded-lg p-3 sm:p-4">
                        <div className="text-2xl font-bold text-green-600">{program.match_percentage}%</div>
                        <div className="text-xs text-green-700">de compatibilité</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/programs")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
          >
            Voir les formations recommandées
          </button>
          <button className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors">
            Télécharger mes résultats
          </button>
        </div>
      </div>
    )
  }

  if (isLoading && questions.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen py-12 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Chargement du test d'orientation...</p>
        </div>
      </div>
    )
  }

  if (error && questions.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm mb-6">
            <p className="font-medium">{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Test d'orientation</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Répondez à quelques questions pour découvrir les formations qui correspondent le mieux à votre profil et à
            vos aspirations.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {renderProgressBar()}

        {currentStep <= questions.length ? (
          <>
            {renderQuestion()}

            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1 || isLoading}
                className={`flex items-center px-5 py-2.5 rounded-lg font-medium transition-colors ${
                  currentStep === 1 || isLoading
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 shadow-sm"
                }`}
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Précédent
              </button>

              <button
                onClick={handleNext}
                disabled={!isCurrentQuestionAnswered() || isLoading}
                className={`flex items-center px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm ${
                  isCurrentQuestionAnswered() && !isLoading
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-300 text-white cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-5 w-5 mr-2 border-t-2 border-b-2 border-white rounded-full"></div>
                    Chargement...
                  </>
                ) : (
                  <>
                    {currentStep === questions.length ? "Terminer" : "Suivant"}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          renderResults()
        )}
      </div>
    </div>
  )
}

export default OrientationTestPage

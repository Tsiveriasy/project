import React, { useState, useEffect } from 'react'
import { Upload, File, AlertCircle, FileText, Trash2 } from 'lucide-react'
import * as XLSX from 'xlsx'
import * as pdfjsLib from 'pdfjs-dist'
import { userService } from '../services/api-services'

// Configure le worker PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString()

interface TranscriptData {
  year: string
  semester: string
  courses: {
    name: string
    grade: string
    credits: number
  }[]
  gpa: number
}

interface TranscriptFile {
  name: string
  type: string
  size: number
  url: string
  uploaded_at: string
}

interface TranscriptUploadProps {
  onTranscriptImport?: (data: TranscriptData[]) => void
  existingFiles?: TranscriptFile[]
  isEditing?: boolean
}

const TranscriptUpload: React.FC<TranscriptUploadProps> = ({ 
  onTranscriptImport, 
  existingFiles = [],
  isEditing = false
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<TranscriptFile[]>(existingFiles)
  const [success, setSuccess] = useState<string | null>(null)
  const [deletingFile, setDeletingFile] = useState<string | null>(null)

  useEffect(() => {
    if (existingFiles && existingFiles.length > 0) {
      setUploadedFiles(existingFiles);
    }
  }, [existingFiles]);

  const handleFileUpload = async (file: File) => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // 1. Uploader le fichier d'abord
      const uploadResponse = await userService.uploadTranscriptFile(file);
      console.log("File uploaded successfully:", uploadResponse);
      
      if (uploadResponse && uploadResponse.file) {
        // Ajouter à la liste des fichiers uploadés
        setUploadedFiles(prevFiles => [...prevFiles, uploadResponse.file]);
        setSuccess(`Le fichier ${file.name} a été téléchargé avec succès.`);
      }
      
      // 2. Si onTranscriptImport est fourni, essayer d'extraire les données structurées
      if (onTranscriptImport) {
        if (file.type === 'application/pdf') {
          await handlePdfDataExtraction(file)
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                   file.type === 'application/vnd.ms-excel') {
          await handleExcelDataExtraction(file)
        }
      }
    } catch (err) {
      console.error('Error uploading file:', err)
      setError('Une erreur est survenue lors du téléchargement du fichier')
    } finally {
      setLoading(false)
    }
  }

  const handleFileDelete = async (fileUrl: string) => {
    try {
      setDeletingFile(fileUrl);
      setError(null);
      setSuccess(null);
      
      // Appeler le service API pour supprimer le fichier
      const response = await userService.deleteTranscriptFile(fileUrl);
      console.log("File deleted successfully:", response);
      
      // Mettre à jour la liste des fichiers
      setUploadedFiles(prevFiles => prevFiles.filter(file => file.url !== fileUrl));
      setSuccess("Le fichier a été supprimé avec succès.");
      
    } catch (err) {
      console.error("Error deleting file:", err);
      setError("Une erreur est survenue lors de la suppression du fichier.");
    } finally {
      setDeletingFile(null);
    }
  };

  const handlePdfDataExtraction = async (file: File) => {
    try {
      const fileUrl = URL.createObjectURL(file)
      const pdf = await pdfjsLib.getDocument(fileUrl).promise
      
      let extractedText = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item: any) => 'str' in item ? item.str : '')
          .join(' ')
        extractedText += pageText + '\n'
      }

      // Parser le texte extrait pour obtenir les données du relevé
      const transcriptData = parseTranscriptText(extractedText)
      if (onTranscriptImport) {
        onTranscriptImport(transcriptData)
      }
      
      URL.revokeObjectURL(fileUrl)
    } catch (err) {
      console.error('Error reading PDF:', err)
      // On n'interrompt pas le processus global en cas d'erreur d'extraction
      console.warn('Failed to extract structured data from PDF, but file was uploaded successfully')
    }
  }

  const handleExcelDataExtraction = async (file: File) => {
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      // Convertir les données Excel en format TranscriptData
      const transcriptData = parseExcelData(jsonData)
      if (onTranscriptImport) {
        onTranscriptImport(transcriptData)
      }
    } catch (err) {
      console.error('Error reading Excel:', err)
      // On n'interrompt pas le processus global en cas d'erreur d'extraction
      console.warn('Failed to extract structured data from Excel, but file was uploaded successfully')
    }
  }

  const parseTranscriptText = (text: string): TranscriptData[] => {
    // Implémenter la logique de parsing du texte PDF
    // Pour l'exemple, on retourne un relevé vide
    return [{
      year: '2024',
      semester: 'S1',
      courses: [],
      gpa: 0
    }]
  }

  const parseExcelData = (data: any[]): TranscriptData[] => {
    // Regrouper les données par année et semestre
    const groupedData = data.reduce((acc: { [key: string]: any[] }, row) => {
      const key = `${row.year}-${row.semester}`
      if (!acc[key]) acc[key] = []
      acc[key].push(row)
      return acc
    }, {})

    // Convertir en format TranscriptData
    return Object.entries(groupedData).map(([key, rows]) => {
      const [year, semester] = key.split('-')
      return {
        year,
        semester,
        courses: rows.map(row => ({
          name: row.course,
          grade: row.grade,
          credits: Number(row.credits) || 0
        })),
        gpa: calculateGPA(rows)
      }
    })
  }

  const calculateGPA = (courses: any[]): number => {
    if (courses.length === 0) return 0

    const totalPoints = courses.reduce((sum, course) => {
      const gradePoints = getGradePoints(course.grade)
      return sum + (gradePoints * (Number(course.credits) || 0))
    }, 0)

    const totalCredits = courses.reduce((sum, course) => 
      sum + (Number(course.credits) || 0), 0)

    return totalCredits > 0 ? totalPoints / totalCredits : 0
  }

  const getGradePoints = (grade: string): number => {
    const gradePoints: { [key: string]: number } = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0
    }
    return gradePoints[grade.toUpperCase()] || 0
  }

  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) {
      return sizeInBytes + ' B';
    } else if (sizeInBytes < 1024 * 1024) {
      return (sizeInBytes / 1024).toFixed(1) + ' KB';
    } else {
      return (sizeInBytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="transcript-upload"
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer
            ${loading ? 'bg-gray-100' : 'hover:bg-gray-50'} 
            ${error ? 'border-red-300' : 'border-gray-300'}`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            ) : (
              <>
                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
                </p>
                <p className="text-xs text-gray-500">PDF ou Excel</p>
              </>
            )}
          </div>
          <input
            id="transcript-upload"
            type="file"
            className="hidden"
            accept=".pdf,.xlsx,.xls"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            disabled={loading}
          />
        </label>
      </div>

      {error && (
        <div className="flex items-center text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center text-green-600 text-sm">
          <AlertCircle className="w-4 h-4 mr-2" />
          {success}
        </div>
      )}

      {/* Liste des fichiers téléchargés */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Fichiers téléchargés</h3>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <FileText className="w-5 h-5 text-indigo-600 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)} • {new Date(file.uploaded_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center">
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium mr-4"
                  >
                    Voir
                  </a>
                  {isEditing && (
                    <button
                      onClick={() => handleFileDelete(file.url)}
                      disabled={deletingFile === file.url}
                      className="text-red-500 hover:text-red-700 transition"
                      title="Supprimer ce fichier"
                    >
                      {deletingFile === file.url ? (
                        <div className="w-5 h-5 border-t-2 border-b-2 border-red-500 rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TranscriptUpload

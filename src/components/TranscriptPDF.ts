import jsPDF from "jspdf"
import "jspdf-autotable"
import type { UserProfile } from "../types/user"

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => void
    lastAutoTable: {
      finalY: number
    }
  }
}

interface Course {
  name: string
  grade: string
  credits: number
}

interface AcademicRecord {
  year: string
  semester: string
  gpa: number
  courses: Course[]
}

export const generateTranscriptPDF = (userData: UserProfile) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  
  // En-tête
  doc.setFontSize(20)
  doc.text("Relevé de notes", pageWidth / 2, 20, { align: "center" })
  
  doc.setFontSize(12)
  doc.text(`Étudiant: ${userData.name}`, 20, 40)
  doc.text(`Niveau d'études: ${userData.educationLevel}`, 20, 50)
  doc.text(`Université: ${userData.currentUniversity}`, 20, 60)
  
  let yPosition = 80

  // Pour chaque année académique
  userData.academicRecords.forEach((record: AcademicRecord) => {
    // Titre de la période
    doc.setFontSize(14)
    doc.text(`${record.year} - ${record.semester}`, 20, yPosition)
    yPosition += 10

    // Tableau des cours
    const tableData = record.courses.map(course => [
      course.name,
      course.credits.toString(),
      course.grade
    ])

    doc.autoTable({
      startY: yPosition,
      head: [["Matière", "Crédits", "Note"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontSize: 12,
        halign: "center"
      },
      styles: {
        fontSize: 10,
        cellPadding: 5,
        halign: "left"
      },
      columnStyles: {
        1: { halign: "center" },
        2: { halign: "center" }
      }
    })

    yPosition = (doc as any).lastAutoTable.finalY + 15

    // GPA du semestre
    doc.setFontSize(12)
    doc.text(`Moyenne du semestre: ${record.gpa.toFixed(2)}`, 20, yPosition)
    yPosition += 20

    // Nouvelle page si nécessaire
    if (yPosition > doc.internal.pageSize.height - 40) {
      doc.addPage()
      yPosition = 20
    }
  })

  // Pied de page
  const today = new Date()
  const dateStr = today.toLocaleDateString("fr-FR")
  doc.setFontSize(10)
  doc.text(`Document généré le ${dateStr}`, 20, doc.internal.pageSize.height - 20)

  // Télécharger le PDF
  doc.save(`releve_notes_${userData.name.replace(/\s+/g, "_")}.pdf`)
}

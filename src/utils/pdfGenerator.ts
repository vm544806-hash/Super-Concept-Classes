import { jsPDF } from 'jspdf';
import { ExamResult } from '../types';

export function generateResultPDF(result: ExamResult) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Colors
  const primaryBlue = '#2563EB';
  const darkText = '#1E293B';

  // Title Header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SMART EXAM PORTAL', 15, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Official Examination Scorecard', 15, 25);

  // Student & Test Details Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, 38, 180, 42, 3, 3, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Candidate Name: ${result.studentName}`, 20, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Test Name: ${result.testTitle}`, 20, 56);
  doc.text(`Category: ${result.category}`, 20, 64);
  doc.text(`Date & Time: ${result.submittedAt.split('T')[0]}`, 20, 72);

  if (result.studentEmail) {
    doc.text(`Email: ${result.studentEmail}`, 110, 48);
  }
  if (result.studentMobile) {
    doc.text(`Mobile: ${result.studentMobile}`, 110, 56);
  }
  doc.text(`Time Taken: ${Math.floor(result.timeTakenSeconds / 60)}m ${result.timeTakenSeconds % 60}s`, 110, 64);

  // Score Highlight Box
  const isPassed = result.percentage >= 40;
  doc.setFillColor(isPassed ? 240 : 254, isPassed ? 253 : 242, isPassed ? 244 : 242);
  doc.setDrawColor(isPassed ? 187 : 254, isPassed ? 247 : 202, isPassed ? 208 : 202);
  doc.roundedRect(15, 88, 180, 35, 3, 3, 'FD');

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isPassed ? 22 : 153, isPassed ? 101 : 27, isPassed ? 52 : 27);
  doc.text(`SCORE: ${result.score} / ${result.totalMarks} (${result.percentage}%)`, 20, 102);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`STATUS: ${isPassed ? 'PASSED / QUALIFIED' : 'NEEDS IMPROVEMENT'}`, 20, 112);

  // Stats Breakdown Grid
  doc.setFillColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);

  // Stats boxes
  const boxY = 132;
  const boxWidth = 40;
  const boxHeight = 22;

  // Correct
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(15, boxY, boxWidth, boxHeight, 2, 2, 'F');
  doc.setTextColor(5, 150, 105);
  doc.text('CORRECT', 20, boxY + 8);
  doc.setFontSize(14);
  doc.text(`${result.correctCount}`, 20, boxY + 17);

  // Wrong
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(62, boxY, boxWidth, boxHeight, 2, 2, 'F');
  doc.setTextColor(220, 38, 38);
  doc.setFontSize(10);
  doc.text('WRONG', 67, boxY + 8);
  doc.setFontSize(14);
  doc.text(`${result.wrongCount}`, 67, boxY + 17);

  // Skipped
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(109, boxY, boxWidth, boxHeight, 2, 2, 'F');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(10);
  doc.text('SKIPPED', 114, boxY + 8);
  doc.setFontSize(14);
  doc.text(`${result.skippedCount}`, 114, boxY + 17);

  // Total Qs
  doc.setFillColor(238, 242, 255);
  doc.roundedRect(155, boxY, boxWidth, boxHeight, 2, 2, 'F');
  doc.setTextColor(79, 70, 229);
  doc.setFontSize(10);
  doc.text('TOTAL Qs', 160, boxY + 8);
  doc.setFontSize(14);
  doc.text(`${result.totalQuestions}`, 160, boxY + 17);

  // Footer Note
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text('This is a computer-generated scorecard issued by Smart Exam Portal. Valid for self-evaluation.', 15, 280);

  doc.save(`Result_${result.studentName.replace(/\s+/g, '_')}_${result.testId}.pdf`);
}

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Define the root of the project to ensure correct pathing regardless of cwd
const ROOT_DIR = path.resolve(); 
const OUTPUT_DIR = path.join(ROOT_DIR, 'generated-certificates');

/**
 * Generates a certificate PDF and saves it to disk.
 * @param {Object} certificate - The certificate document.
 * @param {Object} student - The student document.
 * @returns {Promise<string>} The relative path of the generated PDF (e.g., 'generated-certificates/CERT-XXX.pdf')
 */
export const generateCertificatePDF = (certificate, student) => {
  return new Promise((resolve, reject) => {
    try {
      const filename = `${certificate.certificateId}.pdf`;
      const absoluteFilePath = path.join(OUTPUT_DIR, filename);

      // Ensure directory exists
      if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      }

      // Create a document with landscape orientation for a certificate feel
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margin: 50
      });

      const writeStream = fs.createWriteStream(absoluteFilePath);
      doc.pipe(writeStream);

      // Draw border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();
      doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50).stroke();

      // Certificate Title
      doc
        .fontSize(30)
        .font('Helvetica-Bold')
        .text('CERTIFICATE OF COMPLETION', 0, 120, { align: 'center' });

      doc.moveDown(1);

      // Presentation Text
      doc
        .fontSize(16)
        .font('Helvetica')
        .text('This certificate is proudly presented to', { align: 'center' });

      doc.moveDown(1);

      // Student Name
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text(student.name, { align: 'center' });

      doc.moveDown(1);

      // Reason Text
      doc
        .fontSize(16)
        .font('Helvetica')
        .text('for successfully completing', { align: 'center' });

      doc.moveDown(0.5);

      // Course Name
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text(certificate.courseName, { align: 'center' });

      doc.moveDown(2);

      // Issuer details
      doc
        .fontSize(14)
        .font('Helvetica')
        .text('Issued by:', { align: 'center' });

      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(certificate.issuerOrganization, { align: 'center' });

      doc
        .fontSize(14)
        .font('Helvetica')
        .text(certificate.issuerName, { align: 'center' });

      // Footer details (ID and Date)
      const formattedDate = new Date(certificate.issueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      doc.fontSize(12).font('Helvetica');
      doc.text(`Certificate ID:\n${certificate.certificateId}`, 50, doc.page.height - 100, {
        align: 'left'
      });
      
      doc.text(`Issue Date:\n${formattedDate}`, doc.page.width - 250, doc.page.height - 100, {
        align: 'right'
      });

      // Finalize the PDF
      doc.end();

      writeStream.on('finish', () => {
        // Return relative path for DB storage
        resolve(`generated-certificates/${filename}`);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

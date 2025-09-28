import { pdfjs } from 'react-pdf';
import mammoth from 'mammoth';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const parsePdf = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument(arrayBuffer).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    fullText += textContent.items.map(item => item.str).join(' ');
  }
  return fullText;
};

const parseDocx = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

export const parseResume = async (file) => {
    let fullText = '';
    try {
        if (file.type === 'application/pdf') {
            fullText = await parsePdf(file);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            fullText = await parseDocx(file);
        } else {
            throw new Error('Unsupported file type');
        }

        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
        const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
        // Simple regex for name - looks for 2-3 capitalized words at the start.
        const nameRegex = /^[A-Z][a-z]+(?:\s[A-Z][a-z]+){1,2}/;
        
        const email = fullText.match(emailRegex)?.[0] || '';
        const phone = fullText.match(phoneRegex)?.[0] || '';
        const name = fullText.match(nameRegex)?.[0] || '';
        
        return { name, email, phone };

    } catch (error) {
        console.error("Error parsing resume:", error);
        return { name: '', email: '', phone: '' };
    }
};
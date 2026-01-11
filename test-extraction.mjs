import { extractText } from 'unpdf';
import fs from 'fs';

// Test if we can find any PDF in /tmp or uploads
const testFiles = [
  '/tmp/test.pdf',
  '/tmp/sample.pdf',
  '/hotel/uploads/latest.pdf',
];

console.log('Testing unpdf extraction...');

async function testExtraction() {
  // First check what files exist
  const files = fs.readdirSync('/tmp').filter(f => f.endsWith('.pdf'));
  console.log('PDFs in /tmp:', files);
  
  if (files.length > 0) {
    const testFile = `/tmp/${files[files.length - 1]}`; // Get latest
    console.log('Testing with:', testFile);
    
    const buffer = fs.readFileSync(testFile);
    console.log('Buffer size:', buffer.length, 'bytes');
    
    try {
      const result = await extractText(buffer);
      console.log('SUCCESS!');
      console.log('Total pages:', result.totalPages);
      console.log('Text length:', result.text?.length);
      console.log('First 500 chars:', result.text?.substring(0, 500));
    } catch (err) {
      console.error('EXTRACTION FAILED:', err);
    }
  } else {
    console.log('No PDF files found in /tmp');
  }
}

testExtraction();

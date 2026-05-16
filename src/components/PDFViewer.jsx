import React from 'react';
import '../styles/pdfviewer.css';

const RESUME_PATH = '/aymane belassiria.pdf';

export default function PDFViewer({ assetPath = RESUME_PATH }) {
  return (
    <div className="pdf-viewer">
      <div className="pdf-toolbar">
        <span className="pdf-title">resume.pdf</span>
        <a
          className="pdf-download"
          href={assetPath}
          download
          target="_blank"
          rel="noopener noreferrer"
        >
          Open in new tab
        </a>
      </div>
      <iframe
        className="pdf-frame"
        src={`${assetPath}#toolbar=0&navpanes=0`}
        title="resume.pdf"
      />
    </div>
  );
}

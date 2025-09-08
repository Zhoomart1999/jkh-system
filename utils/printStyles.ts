export const RECEIPT_PRINT_STYLE = `
    @media print {
        body { 
            margin: 0; 
            padding: 0; 
            background: white; 
            font-family: Arial, sans-serif;
        }
        .receipt-wrapper { 
            page-break-after: always; 
            margin: 0; 
            padding: 10mm;
            width: 210mm;
            min-height: 297mm;
        }
        .receipt-wrapper:last-child { 
            page-break-after: avoid; 
        }
        .receipt-page {
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            padding: 0;
        }
        .page-break {
            page-break-before: always;
        }
    }
`;

export const CHECK_NOTICE_PRINT_STYLE = `
    @media print {
        body { 
            margin: 0; 
            padding: 0; 
            background: white; 
            font-family: Arial, sans-serif;
        }
        .meter-readings-registry { 
            width: 210mm; 
            min-height: 297mm; 
            margin: 0; 
            padding: 10mm;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            border: 1px solid #000;
            padding: 3px;
            font-size: 10px;
        }
        th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        input {
            border: none;
            background: transparent;
            width: 100%;
            text-align: center;
        }
    }
`;

export const GENERAL_PRINT_STYLE = `
    @media print {
        body { 
            margin: 0; 
            padding: 0; 
            background: white; 
            font-family: Arial, sans-serif;
        }
        .print-content {
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            padding: 10mm;
        }
        .no-print {
            display: none !important;
        }
    }
`; 
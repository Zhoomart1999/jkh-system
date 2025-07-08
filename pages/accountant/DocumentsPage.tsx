import React from 'react';
import DocumentsTab from './tabs/DocumentsTab';

const DocumentsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Документы</h1>
            <DocumentsTab />
        </div>
    );
};

export default DocumentsPage; 
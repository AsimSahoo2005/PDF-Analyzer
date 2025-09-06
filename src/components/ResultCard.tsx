import React, { useState } from 'react';
import Loader from './Loader';
import { CopyIcon, DownloadIcon, CheckIcon } from './Icons';

interface ResultCardProps {
    title: React.ReactNode;
    content: string;
    isLoading: boolean;
    placeholder: string;
    contentType: 'summary' | 'strategy' | 'quiz';
}

const parseMarkdownToHTML = (markdown: string): string => {
    if (!markdown) return '';

    let processed = markdown.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    const lines = processed.split('\n');
    let html = '';
    let inList = false;

    lines.forEach(line => {
        const trimmedLine = line.trim();
        
        if (trimmedLine.startsWith('# ')) {
            if (inList) { html += '</ul>'; inList = false; }
            const level = trimmedLine.match(/^#+/)?.[0].length || 1;
            const hTag = `h${level > 6 ? 6 : level + 1}`;
            const content = trimmedLine.substring(level).trim();
            const style = { 1: 'text-2xl font-bold', 2: 'text-xl font-semibold', 3: 'text-lg font-medium' }[level] || 'text-base font-medium';
            html += `<${hTag} class="${style} mt-6 mb-3">${content}</${hTag}>`;
            return;
        }

        if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
            if (!inList) {
                html += '<ul class="list-disc pl-6 space-y-2 my-4">';
                inList = true;
            }
            html += `<li>${trimmedLine.substring(2)}</li>`;
            return;
        }
        
        if (inList) {
            html += '</ul>';
            inList = false;
        }

        if (trimmedLine) {
            html += `<p>${trimmedLine}</p>`;
        }
    });

    if (inList) {
        html += '</ul>';
    }

    return html;
};


const ResultCard: React.FC<ResultCardProps> = ({ title, content, isLoading, placeholder, contentType }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        // Create a temporary element to parse HTML and get text content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = parseMarkdownToHTML(content);
        navigator.clipboard.writeText(tempDiv.textContent || "");
        
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = parseMarkdownToHTML(content);
        const textContent = tempDiv.textContent || "";
        
        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${contentType}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    
    return (
        <div className="bg-gray-900 rounded-lg p-4 sm:p-6 min-h-[300px] flex flex-col">
             <div className="flex justify-between items-center mb-4">
                <div className="text-xl font-bold text-gray-200">{title}</div>
                {content && !isLoading && (
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleCopy}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                            title="Copy to clipboard"
                        >
                            {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                        </button>
                        <button
                             onClick={handleDownload}
                             className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                             title="Download as .txt"
                        >
                            <DownloadIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
            <div className="flex-grow prose prose-invert prose-sm sm:prose-base max-w-none text-gray-300">
                {isLoading ? (
                    <Loader message={`Generating ${contentType}...`} />
                ) : content ? (
                     <div dangerouslySetInnerHTML={{ __html: parseMarkdownToHTML(content) }} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        {placeholder}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultCard;
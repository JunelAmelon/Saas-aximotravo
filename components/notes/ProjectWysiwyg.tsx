'use client';

import { useState } from 'react';
import { Bold, Italic, Underline, List, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

export default function ProjectWysiwyg() {
  const [content, setContent] = useState('');

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Éditeur de texte</h2>
      
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-gray-200 p-2 bg-gray-50 flex flex-wrap gap-1">
          <button className="p-2 hover:bg-gray-100 rounded text-gray-700">
            <Bold size={18} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded text-gray-700">
            <Italic size={18} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded text-gray-700">
            <Underline size={18} />
          </button>
          <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
          <button className="p-2 hover:bg-gray-100 rounded text-gray-700">
            <List size={18} />
          </button>
          <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
          <button className="p-2 hover:bg-gray-100 rounded text-gray-700">
            <AlignLeft size={18} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded text-gray-700">
            <AlignCenter size={18} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded text-gray-700">
            <AlignRight size={18} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded text-gray-700">
            <AlignJustify size={18} />
          </button>
        </div>

        {/* Editor */}
        <div className="p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Commencez à écrire..."
            className="w-full min-h-[400px] focus:outline-none resize-none"
          />
        </div>
      </div>
    </div>
  );
}
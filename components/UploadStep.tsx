import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

interface UploadStepProps {
  onImageSelect: (base64: string) => void;
}

const UploadStep: React.FC<UploadStepProps> = ({ onImageSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Selected file:', file.name, 'Size:', file.size);
      
      // 临时测试：限制 1MB，排除大文件导致内存崩溃
      if (file.size > 1024 * 1024) {
        alert('测试模式：请上传小于 1MB 的图片');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('FileReader finished, length:', (reader.result as string).length);
        onImageSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          onImageSelect(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div 
        className="
          w-full max-w-lg h-80 
          border-2 border-dashed border-gray-200 rounded-[32px] 
          bg-brand-cream hover:border-brand-accent/30 hover:bg-white
          flex flex-col items-center justify-center 
          transition-all cursor-pointer group
          relative overflow-hidden shadow-sm hover:shadow-md
        "
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
         {/* Background Grid Pattern Overlay */}
         <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 mb-6 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center group-hover:scale-110 group-hover:shadow-brand-accent/20 transition-all duration-300">
                <Upload className="text-brand-accent" size={32} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-2">上传角色图片</h3>
            <p className="text-gray-500 text-sm mb-1">拖拽图片到这里，或点击上传</p>
            <p className="text-gray-400 text-xs">支持 PNG, JPG, GIF, WebP (最大 20MB)</p>
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/png, image/jpeg, image/gif, image/webp"
          onChange={handleFileChange} 
        />
      </div>
    </div>
  );
};

export default UploadStep;
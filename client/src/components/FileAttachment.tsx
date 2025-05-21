import { useState } from 'react';
import { FileAttachment as FileAttachmentType } from "@/types/chat";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface FileAttachmentProps {
  file: FileAttachmentType;
  className?: string;
  onDownload?: (file: FileAttachmentType) => void;
  onDelete?: (fileId: number) => void;
  showActions?: boolean;
}

export function FileAttachment({ file, className, onDownload, onDelete, showActions = true }: FileAttachmentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getFileIcon = () => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'movie';
    if (file.type.startsWith('audio/')) return 'audio_file';
    if (file.type.includes('pdf')) return 'picture_as_pdf';
    if (file.type.includes('word') || file.type.includes('document')) return 'description';
    if (file.type.includes('excel') || file.type.includes('spreadsheet')) return 'table_chart';
    if (file.type.includes('presentation') || file.type.includes('powerpoint')) return 'slideshow';
    if (file.type.includes('zip') || file.type.includes('archive')) return 'archive';
    if (file.type.includes('text')) return 'text_snippet';
    return 'description';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(file);
    } else {
      window.open(file.url, '_blank');
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(file.id);
    }
  };

  const isPreviewable = file.type.startsWith('image/') || 
                        file.type.startsWith('video/') || 
                        file.type.startsWith('audio/');

  return (
    <>
      <div 
        className={cn(
          "flex items-start p-2 bg-[#1E1E1E] rounded-md border border-[#333333] hover:bg-[#252525] transition-colors",
          className
        )}
      >
        <div className="shrink-0 mr-3">
          <div className="w-10 h-10 bg-[#252525] rounded-md flex items-center justify-center">
            <span className="material-icons text-[#A0A0A0]">{getFileIcon()}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div 
            className="text-sm text-[#E1E1E1] font-medium truncate cursor-pointer hover:underline" 
            onClick={() => isPreviewable ? setIsDialogOpen(true) : handleDownload()}
          >
            {file.name}
          </div>
          <div className="text-xs text-[#A0A0A0] mt-1">
            {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleString()}
          </div>
        </div>

        {showActions && (
          <div className="flex items-center ml-2">
            <TooltipProvider>
              {isPreviewable && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 text-[#A0A0A0] hover:text-[#E1E1E1] hover:bg-[#333333]"
                      onClick={() => setIsDialogOpen(true)}
                    >
                      <span className="material-icons text-sm">visibility</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Preview</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0 text-[#A0A0A0] hover:text-[#E1E1E1] hover:bg-[#333333]"
                    onClick={handleDownload}
                  >
                    <span className="material-icons text-sm">download</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Download</p>
                </TooltipContent>
              </Tooltip>
              
              {onDelete && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 text-[#A0A0A0] hover:text-red-400 hover:bg-red-500/10"
                      onClick={handleDelete}
                    >
                      <span className="material-icons text-sm">delete</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Delete</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      {isPreviewable && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[85vw] max-h-[90vh] bg-[#1E1E1E] border-[#333333]">
            <DialogHeader>
              <DialogTitle className="text-[#E1E1E1] flex items-center">
                <span className="material-icons text-sm mr-2">{getFileIcon()}</span>
                {file.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center p-2 bg-[#252525] rounded-md">
              {file.type.startsWith('image/') && (
                <img 
                  src={file.url} 
                  alt={file.name} 
                  className="max-w-full max-h-[70vh] object-contain"
                />
              )}
              
              {file.type.startsWith('video/') && (
                <video 
                  src={file.url} 
                  controls 
                  className="max-w-full max-h-[70vh]"
                />
              )}
              
              {file.type.startsWith('audio/') && (
                <audio 
                  src={file.url} 
                  controls 
                  className="w-full"
                />
              )}
            </div>
            
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                onClick={handleDownload}
                className="mr-2 bg-[#252525] text-[#E1E1E1] hover:bg-[#333333] border-[#333333]"
              >
                <span className="material-icons text-sm mr-1">download</span>
                Download
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="bg-[#252525] text-[#E1E1E1] hover:bg-[#333333] border-[#333333]"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
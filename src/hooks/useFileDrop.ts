import React, { useCallback, useRef, useState } from 'react';

const hasFiles = (e: React.DragEvent) => Array.from(e.dataTransfer.types || []).includes('Files');

export function useFileDrop(onFiles: (files: File[]) => void) {
  const [isDragging, setDragging] = useState(false);
  const depth = useRef(0);

  const onDragEnter = useCallback((e: React.DragEvent) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    depth.current += 1;
    setDragging(true);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    if (!hasFiles(e)) return;
    depth.current = Math.max(0, depth.current - 1);
    if (depth.current === 0) setDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth.current = 0;
      setDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length) onFiles(files);
    },
    [onFiles]
  );

  return { isDragging, bind: { onDragEnter, onDragOver, onDragLeave, onDrop } };
}
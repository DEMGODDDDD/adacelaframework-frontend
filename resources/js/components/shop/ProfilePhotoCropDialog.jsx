import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slider,
  Stack,
  Typography,
} from '@mui/material';

const CROP_SIZE = 280;
const OUTPUT_SIZE = 512;

const ProfilePhotoCropDialog = ({ file, onCancel, onConfirm }) => {
  const [image, setImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState(null);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (!file) {
      setImageUrl('');
      return undefined;
    }
    const objectUrl = URL.createObjectURL(file);
    setImageUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  useEffect(() => {
    if (!imageUrl) {
      setImage(null);
      return undefined;
    }

    const nextImage = new Image();
    nextImage.onload = () => {
      setImage(nextImage);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setError('');
    };
    nextImage.onerror = () => setError('This image could not be opened. Please choose another photo.');
    nextImage.src = imageUrl;
    return () => {
      nextImage.onload = null;
      nextImage.onerror = null;
    };
  }, [imageUrl]);

  if (!file) return null;

  const baseScale = image
    ? Math.max(CROP_SIZE / image.naturalWidth, CROP_SIZE / image.naturalHeight)
    : 1;
  const imageWidth = image ? image.naturalWidth * baseScale * zoom : CROP_SIZE;
  const imageHeight = image ? image.naturalHeight * baseScale * zoom : CROP_SIZE;
  const overflowX = Math.max(0, (imageWidth - CROP_SIZE) / 2);
  const overflowY = Math.max(0, (imageHeight - CROP_SIZE) / 2);
  const left = (CROP_SIZE - imageWidth) / 2 + pan.x;
  const top = (CROP_SIZE - imageHeight) / 2 + pan.y;

  const handlePointerDown = (event) => {
    if (!image) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragStart({ pointerX: event.clientX, pointerY: event.clientY, panX: pan.x, panY: pan.y });
  };

  const handlePointerMove = (event) => {
    if (!dragStart) return;
    setPan({
      x: Math.max(-overflowX, Math.min(overflowX, dragStart.panX + event.clientX - dragStart.pointerX)),
      y: Math.max(-overflowY, Math.min(overflowY, dragStart.panY + event.clientY - dragStart.pointerY)),
    });
  };

  const handleCrop = () => {
    if (!image) return;
    const scale = baseScale * zoom;
    const sourceSize = CROP_SIZE / scale;
    const sourceX = (imageWidth / 2 - pan.x) / scale - sourceSize / 2;
    const sourceY = (imageHeight / 2 - pan.y) / scale - sourceSize / 2;
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const context = canvas.getContext('2d');
    if (!context) {
      setError('Unable to crop this image in your browser.');
      return;
    }

    context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    canvas.toBlob((blob) => {
      if (!blob) {
        setError('Unable to prepare the cropped photo. Please try again.');
        return;
      }
      const baseName = file.name.replace(/\.[^.]+$/, '');
      const extension = outputType === 'image/png' ? 'png' : 'jpg';
      onConfirm(new File([blob], `${baseName}-cropped.${extension}`, { type: outputType }));
    }, outputType, 0.92);
  };

  return (
    <Dialog open onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 900 }}>Crop profile photo</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ alignItems: 'center', pt: 1 }}>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Keep your face or main subject inside the circle. Drag to reposition and use the slider to zoom.
          </Typography>
          <Box
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={() => setDragStart(null)}
            onPointerCancel={() => setDragStart(null)}
            sx={{
              position: 'relative',
              width: CROP_SIZE,
              height: CROP_SIZE,
              maxWidth: '100%',
              overflow: 'hidden',
              borderRadius: 2,
              bgcolor: '#10243A',
              touchAction: 'none',
              cursor: dragStart ? 'grabbing' : 'grab',
              userSelect: 'none',
            }}
          >
            {image && (
              <Box
                component="img"
                src={imageUrl}
                alt="Photo crop preview"
                draggable={false}
                sx={{
                  position: 'absolute',
                  width: imageWidth,
                  height: imageHeight,
                  left,
                  top,
                  maxWidth: 'none',
                  pointerEvents: 'none',
                }}
              />
            )}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                border: '2px solid rgba(255,255,255,.9)',
                borderRadius: 2,
                boxShadow: '0 0 0 999px rgba(0,0,0,.35)',
                pointerEvents: 'none',
              }}
            />
            <Box
              aria-hidden="true"
              sx={{
                position: 'absolute',
                width: '78%',
                height: '78%',
                top: '11%',
                left: '11%',
                border: '2px dashed rgba(0,0,0,.9)',
                borderRadius: '50%',
                pointerEvents: 'none',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: '50%',
                  top: '12%',
                  bottom: '12%',
                  borderLeft: '1px solid rgba(0,0,0,.65)',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '12%',
                  right: '12%',
                  borderTop: '1px solid rgba(0,0,0,.65)',
                },
              }}
            />
          </Box>
          <Stack spacing={0.5} sx={{ width: '100%' }}>
            <Typography variant="caption" fontWeight={700}>Zoom</Typography>
            <Slider
              aria-label="Photo zoom"
              value={zoom}
              min={1}
              max={3}
              step={0.01}
              onChange={(_, value) => {
                setZoom(value);
                if (image) {
                  const nextWidth = image.naturalWidth * baseScale * value;
                  const nextHeight = image.naturalHeight * baseScale * value;
                  setPan((current) => ({
                    x: Math.max(-Math.max(0, (nextWidth - CROP_SIZE) / 2), Math.min(Math.max(0, (nextWidth - CROP_SIZE) / 2), current.x)),
                    y: Math.max(-Math.max(0, (nextHeight - CROP_SIZE) / 2), Math.min(Math.max(0, (nextHeight - CROP_SIZE) / 2), current.y)),
                  }));
                }
              }}
              disabled={!image}
            />
          </Stack>
          {error && <Typography role="alert" color="error" variant="body2">{error}</Typography>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" onClick={handleCrop} disabled={!image}>Use Photo</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfilePhotoCropDialog;

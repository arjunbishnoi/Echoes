export const MEDIA_TYPES = {
  PHOTO: 'photo',
  VIDEO: 'video',
  AUDIO: 'audio',
  DOCUMENT: 'document',
} as const;

export const FILE_TYPE_LABELS = {
  [MEDIA_TYPES.PHOTO]: 'JPG',
  [MEDIA_TYPES.VIDEO]: 'MP4',
  [MEDIA_TYPES.AUDIO]: 'MP3',
  [MEDIA_TYPES.DOCUMENT]: 'PDF',
} as const;

export type MediaType = typeof MEDIA_TYPES[keyof typeof MEDIA_TYPES];



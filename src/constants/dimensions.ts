import { Dimensions } from "react-native";

export const SCREEN_WIDTH = Dimensions.get("window").width;
export const SCREEN_HEIGHT = Dimensions.get("window").height;

// Hero image dimensions
export const HERO_HEIGHT = Math.round(SCREEN_WIDTH * 0.4);
export const HERO_IMAGE_MARGIN_TOP = 90;

// Avatar sizes
export const AVATAR_SIZE_SMALL = 28;
export const AVATAR_SIZE_MEDIUM = 32;
export const AVATAR_SIZE_LARGE = 40;
export const AVATAR_SIZE_XL = 56;

// Progress bar
export const PROGRESS_TRACK_HEIGHT = 4;
export const PROGRESS_TRACK_HEIGHT_LARGE = 6;

// Media grid
export const MEDIA_GRID_GAP = 2;
export const MEDIA_GRID_COLUMNS = 3;
export const MEDIA_ITEM_SIZE = (SCREEN_WIDTH - (MEDIA_GRID_COLUMNS - 1) * MEDIA_GRID_GAP) / MEDIA_GRID_COLUMNS;

// Tab indicator
export const TAB_INDICATOR_WIDTH_RATIO = 0.6;

// Button sizes
export const FLOATING_BUTTON_SIZE = 56;
export const ICON_BUTTON_SIZE = 44;



import { defineStore } from 'pinia'
import { parseImagePath, type Architecture } from '~/utils/image-path'

// Shape returned by /api/images over the wire (JSON serializes Date -> string).
interface ImageDto {
  path: string;
  timestamp: string;
  size: number;
  checksum: string | null;
}

// Working shape held in the store once timestamps are parsed to Date.
interface ImageInfo {
  path: string;
  timestamp: Date;
  size: number;
  // The checksum object's key, or null where storage holds no checksum for it.
  checksum: string | null;
}

export interface BuildImage extends ImageInfo {
  filename: string;
  version: string;
  arch: Architecture;
  built: Date;
}

export const useImagesStore = defineStore('images', {
  state: () => ({
    allImages: [] as ImageInfo[],
    isLoading: false,
    error: null as unknown,
  }),

  getters: {
    // Latest images for one channel ('daily', 'stable') and architecture.
    getImagesFor: (state) => {
      return (channel: string, arch: Architecture): BuildImage[] => {
        const config = useRuntimeConfig().public as unknown as Record<string, string | undefined>;
        const key = `visible${channel[0]!.toUpperCase()}${channel.slice(1)}Releases`;
        const visibleReleases = String(config[key] ?? '')
          .split(',')
          .map(v => v.trim())
          .filter(Boolean);

        return state.allImages
          .flatMap((image) => {
            const parsed = parseImagePath(image.path);
            // Unrecognised keys are not offered for download.
            if (!parsed || parsed.channel !== channel || parsed.arch !== arch) return [];
            // Use environment/runtime config to determine which releases are visible.
            if (!visibleReleases.includes(parsed.version)) return [];
            return [{
              ...image,
              filename: parsed.filename,
              version: parsed.version,
              arch: parsed.arch,
              built: parsed.built,
            }];
          })
          .sort((a, b) => b.built.getTime() - a.built.getTime());
      };
    },
  },

  actions: {
    async fetchImages(force = false) {
      // Avoid refetching if already loaded and not forced
      if (this.allImages.length > 0 && !force) {
        return this.allImages; // Return existing images
      }

      this.isLoading = true;
      this.error = null;
      try {
        // Use Nuxt 3's $fetch (auto-imported)
        const images = await $fetch<ImageDto[]>('/api/images');
        // Parse the wire timestamps (strings) into Date objects for the store.
        this.allImages = images.map(img => ({
          ...img,
          timestamp: new Date(img.timestamp)
        }));
      } catch (err) {
        console.error('Failed to fetch images:', err);
        this.error = err;
        this.allImages = []; // Clear images on error
        // Optionally re-throw or use showError if called from component setup
        // throw err; 
      } finally {
        this.isLoading = false;
      }
      
      return this.allImages; // Return the fetched (or empty on error) images
    },
  },
}); 
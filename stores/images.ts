import { defineStore } from 'pinia'

// Shape returned by /api/images over the wire (JSON serializes Date -> string).
interface ImageDto {
  path: string;
  timestamp: string;
  size: number;
}

// Working shape held in the store once timestamps are parsed to Date.
interface ImageInfo {
  path: string;
  timestamp: Date;
  size: number;
}

export const useImagesStore = defineStore('images', {
  state: () => ({
    allImages: [] as ImageInfo[],
    isLoading: false,
    error: null as unknown,
  }),

  getters: {
    // Getter to filter images by category derived from path
    // Example categories: 'stable', 'daily', 'daily-pinebookpro', 'daily-rpi'
    getImagesFor: (state) => {
      return (category: string): ImageInfo[] => {
        // Which release lines surface in the UI comes from runtime config, so
        // promoting a new line (e.g. 8.2) is an env change, not a code change.
        const visibleReleases = String(useRuntimeConfig().public.visibleReleases ?? '')
          .split(',')
          .map(v => v.trim())
          .filter(Boolean);
        return state.allImages
          .filter(image => image.path.startsWith(`${category}/`))
          // Hide release lines that haven't been promoted to the UI yet.
          .filter(image => visibleReleases.some(v => image.path.includes(v)))
          // Sort by timestamp descending (newest first)
          .sort((a, b) => {
            const dateA = new Date(a.timestamp).getTime();
            const dateB = new Date(b.timestamp).getTime();
            return dateB - dateA;
          });
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
import { defineStore } from 'pinia'

// Match the interface from the API route
interface ImageInfo {
  path: string;
  timestamp: Date | string; // API might return string initially
  size: number;
}

export const useImagesStore = defineStore('images', {
  state: () => ({
    allImages: [] as ImageInfo[],
    isLoading: false,
    error: null as any | null,
  }),

  getters: {
    // Getter to filter images by category derived from path
    // Example categories: 'stable', 'daily', 'daily-pinebookpro', 'daily-rpi'
    getImagesFor: (state) => {
      return (category: string): ImageInfo[] => {
        return state.allImages
          .filter(image => image.path.startsWith(`${category}/`))
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
        const images = await $fetch<ImageInfo[]>('/api/images');
        // Process timestamps into Date objects if they are strings
        this.allImages = images.map(img => ({
          ...img,
          timestamp: new Date(img.timestamp)
        }));
      } catch (err: any) {
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
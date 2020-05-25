/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */

export const state = () => ({
  isLoaded: false,
});

export const mutations = {
  FINISH_LOADING(state) {
    state.isLoaded = true;
  },
};

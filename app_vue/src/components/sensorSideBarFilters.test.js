import SensorSidebarFilters from './sensorSideBarFilters.vue';
import { mount, enableAutoUnmount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createTestingPinia } from '@pinia/testing';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import VueFeather from 'vue-feather';

let wrapper;

enableAutoUnmount(afterAll);

beforeAll(() => {
  const vuetify = createVuetify({
    components,
    directives
  });
  wrapper = mount(SensorSidebarFilters, {
    global: {
      // global is equivalent to createlocalvue from vue2 jest
      plugins: [
        vuetify,
        createTestingPinia() // // stubs out all store actions unless told otherwise
      ],
      components: {
        VueFeather
      }
    }
  });
});

describe('Given SensorSidebarFilters component', () => {
  it('component should be rendered', () => {
    expect(wrapper).toBeTruthy();
  });
});

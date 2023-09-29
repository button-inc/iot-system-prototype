import SensorSidebar from './sensorSidebar.vue';
import { shallowMount, enableAutoUnmount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
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
  wrapper = shallowMount(SensorSidebar, {
    global: {
      // global is equivalent to createlocalvue from vue2 jest
      plugins: [vuetify],
      components: {
        VueFeather
      }
    }
  });
});

describe('Given SensorSidebar component', () => {
  it('component should be rendered', () => {
    expect(wrapper).toBeTruthy();
  });
});

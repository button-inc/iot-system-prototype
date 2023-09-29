import SensorRouteBlock from './sensorRouteBlock.vue';
import { shallowMount, enableAutoUnmount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import VueFeather from 'vue-feather';

let wrapper;

enableAutoUnmount(afterAll);

const props = {
  selectedRouteList: [],
  startPointAddress: '',
  endPointAddress: ''
};

beforeAll(() => {
  const vuetify = createVuetify({
    components,
    directives
  });
  wrapper = shallowMount(SensorRouteBlock, {
    props,
    global: {
      // global is equivalent to createlocalvue from vue2 jest
      plugins: [
        vuetify,
        createTestingPinia() // stubs out all store actions unless told otherwise
      ],
      components: {
        VueFeather
      }
    }
  });
});

describe('Given SensorRouteBlock component', () => {
  it('component should be rendered', () => {
    expect(wrapper).toBeTruthy();
  });
});

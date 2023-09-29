import SensorMapMarker from './sensorMapMarker.vue';
import { shallowMount, enableAutoUnmount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import VueFeather from 'vue-feather';

let wrapper;

enableAutoUnmount(afterAll);

const props = {
  sensor: {
    id: '265434817',
    sensor_type: 'solid bin level',
    fill_level: 40,
    lat: 43.452197,
    long: -80.147244,
    manufacturer: 'Sensational Sensors',
    bin_name: 'Cherry Bin',
    address_line1: '99473 Fruit Blvd',
    address_line2: 'Bolton, ON L7E 0Y2',
    group: 'Bolton South',
    bin_type: 'EMW Cathedral Container 20yd',
    material_type: 'Compost',
    asset_tag: 'top',
    bin_volume: 'small'
  }
};

beforeAll(() => {
  const vuetify = createVuetify({
    components,
    directives
  });
  wrapper = shallowMount(SensorMapMarker, {
    props,
    global: {
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

describe('Given SensorMapMarker component', () => {
  it('component should be rendered', () => {
    expect(wrapper).toBeTruthy();
  });
});

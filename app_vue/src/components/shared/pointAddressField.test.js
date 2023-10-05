import PointAddressField from './pointAddressField.vue';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

let wrapper;

enableAutoUnmount(afterAll);

const props = {
  label: 'label',
  addressOptions: ['6900 Airport Rd Mississauga ON'],
  modelValue: '6900 Airport Rd Mississauga ON'
};

beforeAll(() => {
  const vuetify = createVuetify({
    components,
    directives
  });
  wrapper = mount(PointAddressField, {
    props,
    global: {
      // global is equivalent to createlocalvue from vue2 jest
      plugins: [vuetify]
    }
  });
});

describe('Given PointAddressField component', () => {
  it('component should be rendered', () => {
    expect(wrapper).toBeTruthy();
  });
});

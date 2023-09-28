import SensorMap from './sensorMap.vue';
import { mount } from '@vue/test-utils';

let wrapper;

const options = {
  mocks: {},
  methods: []
};

describe('SensorMap component', () => {
  it('should render component', () => {
    wrapper = mount(SensorMap, options);
    expect(wrapper).toBeTruthy();
  });
});

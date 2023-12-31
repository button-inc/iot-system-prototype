import SensorMap from './sensorMap.vue';
import { shallowMount, enableAutoUnmount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

let wrapper;

enableAutoUnmount(afterAll);

jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve('value'))
}));

beforeAll(() => {
  wrapper = shallowMount(SensorMap, {
    global: {
      plugins: [createTestingPinia()] // stubs out all store actions unless told otherwise
    }
  });
});

describe('Given SensorMap component', () => {
  it('component should be rendered', () => {
    expect(wrapper).toBeTruthy();
  });
});

import HelloWorld from "./HelloWorld.vue"
import { mount } from "@vue/test-utils"

describe("SensorMap component", () => {
    it("renders properly", () => {
        const wrapper = mount(HelloWorld, { props: { msg: "Hello Jest" } })

        expect(wrapper.text()).toContain("Hello Jest")
    })
})

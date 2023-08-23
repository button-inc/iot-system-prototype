import {getIconName} from "../components/SensorMarker";

describe("Map Integration Tests", () => {

  let iconResult;

  it("Returns the healthy icon when under alert threshold", () => {
    iconResult = getIconName(50, 0, 100, 80, "", "", "", "", "", "", "", "");
    expect(iconResult).toBe("healthy");
  });

  it("Returns the full icon when over alert threshold", () => {
    iconResult = getIconName(50, 0, 100, 30, "", "", "", "", "", "", "", "");
    expect(iconResult).toBe("full");
  });

  it("Returns the default icon fill level is outside of filter threshold", () => {
    iconResult = getIconName(25, 50, 100, 30, "", "", "", "", "", "", "", "");
    expect(iconResult).toBe("default");
  });

  it("Returns the error icon when inputs are undefined", () => {
    iconResult = getIconName(25, 50, undefined, 30, "", "", "", "", "", "", "", "");
    expect(iconResult).toBe("error");
  });

  it("Returns the correct icon (healthy) with multiple filters active and matching", () => {
    iconResult = getIconName(50, 0, 100, 90, "Bolton South", "bottom", "EMW Cathedral Container 10yd", "small", "Bolton South", "bottom", "EMW Cathedral Container 10yd", "small");
    expect(iconResult).toBe("healthy");
  });

  it("Returns the correct icon (default) with multiple filters active and not matching", () => {
    iconResult = getIconName(50, 0, 100, 90, "Bolton South", "top", "EMW Cathedral Container 10yd", "small", "Bolton South", "bottom", "EMW Cathedral Container 10yd", "small");
    expect(iconResult).toBe("default");
  });

});

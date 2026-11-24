import { act, create, ReactTestRenderer } from "react-test-renderer";

import { useAppStore } from "../../state/app-store";
import { themes } from "../../theme";
import ThemedSelect from "../ThemedSelect";

jest.mock("@expo/vector-icons", (): { Ionicons: () => null } => ({ Ionicons: () => null }));
jest.mock("@react-native-async-storage/async-storage", (): unknown =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

const OPTIONS = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
];

function renderSelect(onValueChange: (value: string) => void): ReactTestRenderer {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(
      <ThemedSelect options={OPTIONS} selectedValue="dark" onValueChange={onValueChange} testID="select" />,
    );
  });
  if (!renderer) {
    throw new Error("ThemedSelect did not render");
  }
  return renderer;
}

describe("ThemedSelect", () => {
  it("shows the selected label and reports a new selection", () => {
    const onValueChange = jest.fn();
    const renderer = renderSelect(onValueChange);

    expect(JSON.stringify(renderer.toJSON())).toContain("Dark");

    const trigger = renderer.root.find(
      (node) => node.props.testID === "select" && typeof node.props.onPress === "function",
    );
    act(() => {
      trigger.props.onPress();
    });

    const lightOption = renderer.root.find(
      (node) => node.props.accessibilityLabel === "Light" && typeof node.props.onPress === "function",
    );
    act(() => {
      lightOption.props.onPress();
    });

    expect(onValueChange).toHaveBeenCalledWith("light");
  });

  it("paints the dropdown with the app theme instead of platform defaults", () => {
    act(() => {
      useAppStore.setState({ themePreference: "dark" });
    });
    const renderer = renderSelect(jest.fn());

    act(() => {
      renderer.root
        .find((node) => node.props.testID === "select" && typeof node.props.onPress === "function")
        .props.onPress();
    });

    const tree = JSON.stringify(renderer.toJSON());
    expect(tree).toContain(themes.dark.card);
    expect(tree).toContain(themes.dark.hintSelected);
    expect(tree).toContain(themes.dark.input);

    act(() => {
      useAppStore.setState({ themePreference: "system" });
    });
  });
});

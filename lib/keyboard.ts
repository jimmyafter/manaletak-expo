import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

/** Current on-screen keyboard height, 0 when hidden. Add it as bottom padding in a ScrollView. */
export function useKeyboardHeight(): number {
  const [h, setH] = useState(0);
  useEffect(() => {
    const a = Keyboard.addListener("keyboardDidShow", (e) => setH(e.endCoordinates.height));
    const b = Keyboard.addListener("keyboardDidHide", () => setH(0));
    return () => { a.remove(); b.remove(); };
  }, []);
  return h;
}

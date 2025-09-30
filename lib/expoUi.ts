/* Runtime helper to safely access Expo UI SwiftUI components without breaking Android/Web builds. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getExpoSwiftUI(): any | null {
  try {
    // Avoid Metro static resolution by using eval('require')
    // eslint-disable-next-line no-eval
    const req = (eval as unknown as (id: string) => unknown) as (id: string) => unknown;
    const mod = req && req("@expo/ui/swift-ui");
    return mod ?? null;
  } catch {
    return null;
  }
}



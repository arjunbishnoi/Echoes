export function getExpoSwiftUI(): any | null {
  try {
    const req = (eval as unknown as (id: string) => unknown) as (id: string) => unknown;
    const mod = req && req("@expo/ui/swift-ui");
    return mod ?? null;
  } catch {
    return null;
  }
}



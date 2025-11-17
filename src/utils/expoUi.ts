function safeRequire<T = any>(moduleId: string): T | null {
  try {
    const req = (eval as unknown as (id: string) => unknown) as (id: string) => unknown;
    const mod = req && req(moduleId);
    return (mod as T) ?? null;
  } catch {
    return null;
  }
}

export function getExpoSwiftUI(): any | null {
  return safeRequire("@expo/ui/swift-ui");
}

export function getExpoJetpackCompose(): any | null {
  return safeRequire("@expo/ui/jetpack-compose");
}

export function getExpoJetpackComposePrimitives(): any | null {
  return safeRequire("@expo/ui/jetpack-compose-primitives");
}



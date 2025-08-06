declare global {
  const chrome: {
    runtime: {
      getManifest: () => { version: string };
      onInstalled: {
        addListener: (callback: () => void) => void;
      };
      onMessage: {
        addListener: (
          callback: (
            request: any,
            sender: any,
            sendResponse: (response: any) => void
          ) => boolean | void
        ) => void;
      };
    };
    tabs: {
      create: (options: { url: string; active: boolean }) => Promise<any>;
    };
    storage?: {
      local: {
        get: (keys: string[]) => Promise<Record<string, any>>;
        set: (items: Record<string, any>) => Promise<void>;
      };
    };
  };
}

export {};

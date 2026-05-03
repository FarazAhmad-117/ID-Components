/**
 * When Node is started with invalid experimental Web Storage flags (for example an
 * incomplete `--localstorage-file`), global `localStorage` can exist but violate the
 * Storage interface. `next-themes` (pulled in by `fumadocs-ui`) then crashes with
 * "localStorage.getItem is not a function" during prerender / SSR if `window` is
 * shimmed but storage is malformed.
 *
 * Clearing broken objects restores the behaviour of guarding on a real DOM later.
 */

function stripBrokenLocalStorage(scope: object) {
  try {
    const candidate: unknown = Reflect.get(scope as object, 'localStorage');
    if (candidate === null || candidate === undefined) return;
    if (typeof (candidate as Storage).getItem !== 'function')
      Reflect.deleteProperty(scope, 'localStorage');
  } catch {
    /* ignore proxies / accessors that refuse reflection */
  }
}

export async function register() {
  stripBrokenLocalStorage(globalThis);
  const shimmedWindow = Reflect.get(globalThis, 'window') as object | undefined;
  if (typeof shimmedWindow === 'object' && shimmedWindow !== null)
    stripBrokenLocalStorage(shimmedWindow);
}

// CSP の Trusted Types（require-trusted-types-for 'script'）で、スクリプトとして読み込める URL を
// 同一オリジンの Blob URL だけに絞る。heic-to が HEIC 変換用の Worker を Blob URL から起動するために必要。
// 他のモジュールより先に評価されるよう、エントリーの最初で import する。
if (typeof window !== 'undefined' && window.trustedTypes?.createPolicy) {
  window.trustedTypes.createPolicy('default', {
    createScriptURL: (url) => {
      if (url.startsWith(`blob:${window.location.origin}/`)) return url;
      throw new TypeError(`Trusted Types によりブロックしました: ${url}`);
    },
  });
}

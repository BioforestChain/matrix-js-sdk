import { dwebServiceWorker } from "@plaoc/plugins";
import { PromiseOut } from "@bnqkl/util-web/extends-promise-out";
interface SearchParams {
    [key: string]: any;
}
export const getExternalAppData = async (
    mmid: `${string}.dweb`,
    pathname: string,
    search: SearchParams,
): Promise<{
    getData: () => any;
    abort: () => void;
}> => {
    const controller = new AbortController();
    const url = new URL(pathname, document.baseURI);
    if (search) {
        if (pathname === "/wallet/authorize/signature") {
            url.searchParams.set("signaturedata", JSON.stringify(search));
        } else {
            for (const key in search) {
                url.searchParams.set(key, search[key]);
            }
        }
    }

    const promiseOut = new PromiseOut();
    dwebServiceWorker
        .externalFetch(mmid, url, {
            signal: controller.signal,
        })
        .then(async (response) => {
            const dataJson = await response.json();
            promiseOut.resolve(dataJson.data);
            return response;
        })
        .catch((error) => {
            promiseOut.reject(error);
        });
    return {
      getData: (): Promise<any> => promiseOut.promise,
      abort: (): void => {
        promiseOut.reject(new Error("request abort"));
        return controller.abort();
      },
    };
};

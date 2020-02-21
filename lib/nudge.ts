import { Details } from "./Details";
import traverse from "traverse";
import is from "@sindresorhus/is";

export type TransformFunc<A, B> = (value: A, detail: Details) => Promise<B> | B;
export type Transform<T> = {
    [K in keyof T]: T[K] extends TransformFunc<any, infer B> ? B : Transform<T[K]>;
};

export function nudgeSync<T>(shape: any, modifier: T): [any, Transform<T>]{
    var search = traverse(modifier);
    try {
        var result = search.reduce(function (acc, value:any) {
            
            const self = this;
            const path = this.path;
            const dotpath = path.join(".");
            const parent = self.parent?.node;
            const transformSearcher = traverse(shape);
            const transformValue = transformSearcher.get(this.path);
            if (this.isLeaf && typeof value === "function") {
                var detail = {
                    path: dotpath,
                    object: modifier
                };
                if (is.promise(acc)) {
                    return acc.then(function () {
                        var result = value.call(parent, transformValue, detail);
                        if (is.promise(result)) {
                            return result.then(function (x) {
                                if (!is.undefined(x)) {
                                    transformSearcher.set(self.path, x);
                                }
                            });
                        }
                        else {
                            if (!is.undefined(result)) {
                                transformSearcher.set(self.path, result);
                            }
                        }
                    });
                }
                else {
                    var result = value.call(parent, transformValue, detail);
                    if (is.promise(result)) {
                        return result.then(function (x) {
                            if (!is.undefined(x)) {
                                transformSearcher.set(self.path, x);
                            }
                        });
                    }
                    else {
                        if (!is.undefined(result)) {
                            transformSearcher.set(self.path, result);
                        }
                    }
                }
            }
        }, null);
        if (is.promise(result)) {
            return result.then(function () {
                return [void 0, shape];
            }) as any;
        }
        else {
            return [void 0, shape];
        }
    }
    catch (e) {
        return [e, shape];
    }
}
export async function Nudge<T>(shape: any, modifier: T): Promise<[any, Transform<T>]>{
    return nudgeSync(shape,modifier)
}
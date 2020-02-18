
import * as types from "utility-types";
import * as traverse from "traverse";
import is from "@sindresorhus/is";

type NotPromise<T,S=any> = T extends Promise<infer S>?S:T
type OnlyMethods<T> = {[K in keyof T]:T[K] extends (value:any,err:string[])=>any?NotPromise<ReturnType<T[K]>>:OnlyMethods<T[K]>}; 

export type Show<T,S=any> = {[K in keyof T]:T[K] extends (value:infer S,error:string[])=>void|Promise<void>?NotPromise<S>:Show<T[K],S>}

export function Validation<T>(value:Show<T>,validation:T):Promise<[string[],Show<T>]>|[string[],Show<T>]{
    const test = traverse.default(value)
    const errorList:string[] = []

    const results = traverse.reduce(validation,function(acc,func:(property,error:string[])=>void){
        if(this.isLeaf && typeof func === "function"){
            const self = this;
            if(is.promise(acc)){

                return acc.then(function(){
                    const path = self.path;
                    const parent= (self.parent||{}).node;
                    const testable = test.get(path);
                    const result = func.call(parent,testable,errorList)
                    return result;
                })

            }else{
                const path = self.path;
                const parent= (self.parent||{}).node;
                const testable = test.get(path);
                const result = func.call(parent,testable,errorList)
                return result;

            }

        }else if(this.isLeaf){
            throw new Error("Validation Object must contain only functions")
        }
    },null as any)

    if(is.promise(results)){
        return results.then(()=>{
            return [errorList.length>0?errorList:null as any as string[],value]
        })
    }else{
        return [errorList.length>0?errorList:null as any as string[],value];
    }
}


export function ValidationSync<T>(value:Show<T>,validation:T):[string[],Show<T>]{
    const result = Validation(value,validation)
    if(is.promise(result)){
        throw new Error("Validation sync can't have async methods")
    }else{
        return result;
    }
}





























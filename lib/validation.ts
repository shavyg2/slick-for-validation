
import * as traverse from "traverse";
import is from "@sindresorhus/is";
import { Details } from "./Details";

type SimpleFunc<T = any> = (value: T, err: string[]) => any;
type DetailFunc<T = any> = (value: T, err: string[],details:Details) => any;
type TestFunc<T = any> = SimpleFunc<T> | DetailFunc<T>;






type NotPromise<T, S = any> = T extends Promise<infer S> ? S : T
type OnlyMethods<T> = { [K in keyof T]: T[K] extends TestFunc ? NotPromise<ReturnType<T[K]>> : OnlyMethods<T[K]> };

export type Show<T, S = any> = { [K in keyof T]: T[K] extends TestFunc<infer S> | Promise<void> ? NotPromise<S> : Show<T[K], S> }

function handleError(e:any,errors:string[],{path}:Details){
    if(is.error(e)){
        errors.push(`${path}: ${e.message}`)
    }else if(is.object(e)){
        errors.push(`${path}: ${JSON.stringify(e)}`)
    }else{
        errors.push(`${path}: ${e}`);
    }
}

function ErrorHandlingTestFunction(func:TestFunc):DetailFunc{

    return (value:any,error:string[],detail:Details)=>{
        try{
            const result = func(value,error,detail)
            if(is.promise(result)){
                return result.catch(e=>{
                    handleError(e,error,detail);
                })
            }
            return result;
        }catch(e){
            handleError(e,error,detail);
        }
    }
}

export function Validation<T>(value: Show<T>, validation: T): Promise<[string[], Show<T>]> | [string[], Show<T>] {
    const test = traverse.default(value)
    const errorList: string[] = []

    const results = traverse.reduce(validation, function (acc, userFunc: DetailFunc<T>) {
        if (this.isLeaf && typeof userFunc === "function") {
            const func = ErrorHandlingTestFunction(userFunc);
            const self = this;
            const detail:Details = {
                path:this.path.join("."),
                object:value
            }
            if (is.promise(acc)) {

                return acc.then(function () {
                    const path = self.path;
                    const parent = (self.parent || {}).node;
                    const testable = test.get(path);
                    const result = func.call(parent, testable, errorList,detail)
                    return result;
                })

            } else {
                const path = self.path;
                const parent = (self.parent || {}).node;
                const testable = test.get(path);
                const result = func.call(parent, testable, errorList,detail)
                return result;

            }

        } else if (this.isLeaf) {
            throw new Error("Validation Object must contain only functions")
        }
    }, null as any)

    if (is.promise(results)) {
        return results.then(() => {
            return [errorList.length > 0 ? errorList : null as any as string[], value]
        })
    } else {
        return [errorList.length > 0 ? errorList : null as any as string[], value];
    }
}


export function ValidationSync<T>(value: Show<T>, validation: T): [string[], Show<T>] {
    const result = Validation(value, validation)
    if (is.promise(result)) {
        throw new Error("Validation sync can't have async methods")
    } else {
        return result;
    }
}



function Group<T>(func: TestFunc<T>, func2: TestFunc<T>) {
    return (value: T, error: string[],detail:Details) => {
        const result = func(value, error,detail);
        if (is.promise(result)) {
            return result.then(() => {
                const result = func2(value, error,detail)
                return result;
            })
        } else {
            const result = func2(value, error,detail);
            return result;
        }
    }
}

export function Combine<T>(...func: TestFunc<T>[]) {
    return func.reduce(Group);
}



export function Either<T>(func: TestFunc<T>, func2: TestFunc<T>) {
    return (value: T, error: string[],detail:Details) => {
        const errorList1: string[] = [];
        const errorList2: string[] = [];

        const result1 = func(value, errorList1,detail);
        const result2 = func2(value, errorList2,detail);

        if (is.promise(result1) || is.promise(result2)) {
            return Promise.all([Promise.resolve(result1), Promise.resolve(result2)]).then(([r1, r2]) => {

                if (errorList1.length && errorList2.length) {
                    error.push(...errorList1, ...errorList2)
                }
            })
        } else {

            if (errorList1.length && errorList2.length) {
                error.push(...errorList1, ...errorList2)
            }
        }
    }
}
























import is from "@sindresorhus/is/dist"
import { Validation, Show, Combine, Either } from "../lib/validation";

describe("Sync Validation",()=>{


    const validation = {
        async name(name:string,error:string[],{path}){
            if(!is.string(name)){
                error.push(`property ${path} is required`)
            }
        }
    }

    async function isString(value:string,error:string[]){
        if(!is.string(value)){
            error.push("string value is required");
        }
    }


    async function isNumber(value:number,error:string[],{path}){
        if(!is.number(value)){
            error.push(`${path} is should be a number`);
        }
    }

    async function hasLength(value:string,error:string[]){
        if(value.length<=2){
            error.push("string must be at least 3 character");
        }
    }

    async function notExist(value:string,error:string[]){
        if(!is.nullOrUndefined(value)){
            error.push("value is defined")
        }
    }


    it("should be able to validate",async ()=>{
        const [err,person] = await Validation({
            name:"Sarah"
        },validation)

        expect(err).toBeFalsy();
        expect(person.name).toBe("Sarah");
    })


    it("should not validate incorrect person",async()=>{
        const raw = {} as any;
        const [err,person] =  await Validation(raw,validation);
        expect(err).toBeTruthy();
        expect(err.length).toBe(1);
        expect(raw).toBe(person);
    })

    it("should be able to combine sync validation function",async()=>{
            const combineValidation = {
                name:Combine(isString,hasLength)
            }

            var [err,result] = await Validation({
                name:"david"
            },combineValidation)

            expect(err).toBeFalsy();


            var [err,result] = await Validation({
                name:"ba"
            },combineValidation);

            expect(err).toBeTruthy();
    })


    it("should be able to use either result options",async()=>{
        const eitherValidation = {
            name:Either(notExist,isString)
        }

        var [err,person] = await Validation({
            name:null as unknown as string
        },eitherValidation)

        expect(err).toBeFalsy();

        var [err,person] = await Validation({
            name:1 as any as string
        },eitherValidation);
        expect(err).toBeTruthy();
    })

    describe("Nested Validation",()=>{

        it("should give good result on nested types",async()=>{
            const personValidation = {
                name:isString,
                address:{
                    unit:isNumber,
                    street:isString,
    
                }
            }
    
            const [err,person] = await Validation({
                name:"John",
                address:{
                    unit:2,
                    street:"hill top"
                }
            },personValidation)
    
    
            expect(err).toBeFalsy()
        })


        it("should bad results on incorrect nested types",async()=>{
            const personValidation = {
                name:isString,
                address:{
                    unit:isNumber,
                    street:isString,
    
                }
            }
    
            const [err,person] = await Validation({
                name:"John",
                address:{
                    unit:null as any as number,
                    street:"hill top"
                }
            },personValidation)
    
    
            expect(err).toBeTruthy()
        })

    })

})
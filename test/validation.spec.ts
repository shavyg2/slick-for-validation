import is from "@sindresorhus/is/dist"
import { ValidationSync, Show, Validation, Combine, Either } from "../lib/validation"




describe("Sync Validation",()=>{


    const validation = {
        name(name:string,error:string[],{path}){
            if(!is.string(name)){
                error.push(`property ${path} is required`)
            }
        }
    }

    function isString(value:string,error:string[]){
        if(!is.string(value)){
            error.push("string value is required");
        }
    }


    function isNumber(value:number,error:string[],{path}){
        if(!is.number(value)){
            error.push(`${path} is should be a number`);
        }
    }

    function hasLength(value:string,error:string[]){
        if(value.length<=2){
            error.push("string must be at least 3 character");
        }
    }

    function notExist(value:string,error:string[]){
        if(!is.nullOrUndefined(value)){
            error.push("value is defined")
        }
    }


    it("should be able to validate",()=>{
        const [err,person] = ValidationSync({
            name:"Sarah"
        },validation)

        expect(err).toBeFalsy();
        expect(person.name).toBe("Sarah");
    })


    it("should not validate incorrect person",()=>{
        const raw = {} as any;
        const [err,person] =  ValidationSync(raw,validation);
        expect(err).toBeTruthy();
        expect(err.length).toBe(1);
        expect(raw).toBe(person);
    })

    it("should be able to combine sync validation function",()=>{
            const combineValidation = {
                name:Combine(isString,hasLength)
            }

            var [err,result] = ValidationSync({
                name:"david"
            },combineValidation)

            expect(err).toBeFalsy();


            var [err,result] = ValidationSync({
                name:"ba"
            },combineValidation);

            expect(err).toBeTruthy();
    })


    it("should be able to use either result options",()=>{
        const eitherValidation = {
            name:Either(notExist,isString)
        }

        var [err,person] = ValidationSync({
            name:null as unknown as string
        },eitherValidation)

        expect(err).toBeFalsy();

        var [err,person] = ValidationSync({
            name:1 as any as string
        },eitherValidation);
        expect(err).toBeTruthy();
    })

    describe("Nested Validation",()=>{

        it("should give good result on nested types",()=>{
            const personValidation = {
                name:isString,
                address:{
                    unit:isNumber,
                    street:isString,
    
                }
            }
    
            const [err,person] = ValidationSync({
                name:"John",
                address:{
                    unit:2,
                    street:"hill top"
                }
            },personValidation)
    
    
            expect(err).toBeFalsy()
        })


        it("should bad results on incorrect nested types",()=>{
            const personValidation = {
                name:isString,
                address:{
                    unit:isNumber,
                    street:isString,
    
                }
            }
    
            const [err,person] = ValidationSync({
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
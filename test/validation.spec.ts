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


    it("should validate when just error is thrown",()=>{
        const person = {
            name:null as any as string
        }
        const test = {
            name(name:string,error:string[]){
                if(name.length<5){
                    error.push("name needs to be atleast 5 change")
                }
            }
        }
        const [err,result] = ValidationSync(person,test)
        expect(err.length).toBeGreaterThan(0);
    })
    it("should validate when just object is thrown",()=>{
        const person = {
            name:null as any as string
        }
        const test = {
            name(name:string,error:string[]){
                throw {
                    code:404
                }
            }
        }
        const [err,result] = ValidationSync(person,test)
        expect(err.length).toBeGreaterThan(0);
    })
    it("should validate when just object is thrown",()=>{
        const person = {
            name:null as any as string
        }
        const test = {
            name(name:string,error:string[]){
                throw "This is not allowed";
            }
        }
        const [err,result] = ValidationSync(person,test)
        expect(err.length).toBeGreaterThan(0);
    })

    it("should handle when incorrect types",()=>{

        function incorrect(){

            const incorrectType = {
                name:"string value"
            } as any;


            Validation({
                name:"jack"
            },incorrectType)

        }


        expect(incorrect).toThrow();
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


    describe("Async Error",()=>{

        it("should catch async error",()=>{

            const person = {
                name:"billy"
            }

            const test = {
                async name(name:string,error:string[]){
                    error.push("async shouldn't work")
                }
            }
            function shouldFail(){
                const [err,result] = ValidationSync(person,test);
            }

            expect(shouldFail).toThrow();
            
        })
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
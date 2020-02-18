import is from "@sindresorhus/is/dist"
import { ValidationSync, Show, Validation } from "../lib/validation"




describe("Sync Validation",()=>{


    const validation = {
        name(name:string,error:string[]){
            if(!is.string(name)){
                error.push("property name is required")
            }
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

})
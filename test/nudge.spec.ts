import is from "@sindresorhus/is";
import { nudgeSync } from "../dist/nudge";


describe("Nudge",()=>{


    const data = {
        age:"11"
    }

    const transform = {
        age(age:string){
            if(is.numericString(age)){
                return parseFloat(age)
            }
        }
    }
    it("should be able to convert a string to a number",()=>{
        const [err,person] = nudgeSync(data,transform)
        expect(person.age).toBe(11);

    })

})